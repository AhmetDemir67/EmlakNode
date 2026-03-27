'use strict';

const { sorgu } = require('../config/db');

// ----------------------------------------------------------------
// İLAN EKLE (Create Listing)
// POST /api/ilanlar
// Korumalı: tokenDogrula middleware gerekli
// ----------------------------------------------------------------
const ilanEkle = async (req, res) => {
    // --- 1. dukkan_id'yi token'dan al (req.kullanici, tokenDogrula tarafından set edildi) ---
    const { id: kullanici_id, rol, dukkan_id } = req.kullanici;

    // Sadece bir dükkana bağlı kullanıcılar ilan ekleyebilir
    if (!dukkan_id) {
        return res.status(403).json({
            basarili: false,
            mesaj: 'İlan eklemek için bir emlak ofisine bağlı olmanız gerekiyor. Müşteriler ilan ekleyemez.',
        });
    }

    // --- 2. İstek gövdesinden alanları al ---
    const {
        baslik,
        aciklama,
        fiyat,
        metrekare,
        oda_sayisi,
        bina_yasi,
        kat,
        isinma_tipi,
        enlem,
        boylam,
        ai_aciklama,
    } = req.body;

    // --- 3. Zorunlu alan kontrolü ---
    if (!baslik || !fiyat || !metrekare) {
        return res.status(400).json({
            basarili: false,
            mesaj: 'baslik, fiyat ve metrekare alanları zorunludur.',
        });
    }

    // --- 4. Tip doğrulama ---
    if (isNaN(parseFloat(fiyat)) || parseFloat(fiyat) <= 0) {
        return res.status(400).json({
            basarili: false,
            mesaj: 'fiyat pozitif bir sayı olmalıdır.',
        });
    }

    if (isNaN(parseFloat(metrekare)) || parseFloat(metrekare) <= 0) {
        return res.status(400).json({
            basarili: false,
            mesaj: 'metrekare pozitif bir sayı olmalıdır.',
        });
    }

    // --- 5. Veritabanına kaydet ---
    // dukkan_id token'dan otomatik alınır, kullanıcı dışarıdan geçiremez
    const yeniIlan = await sorgu(
        `INSERT INTO ilanlar
            (baslik, aciklama, fiyat, metrekare, oda_sayisi, bina_yasi,
             kat, isinma_tipi, enlem, boylam, ai_aciklama, dukkan_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [
            baslik.trim(),
            aciklama       || null,
            parseFloat(fiyat),
            parseFloat(metrekare),
            oda_sayisi     || null,   // Örn: '3+1', '2+1'
            bina_yasi      ? parseInt(bina_yasi)  : null,
            kat            ? parseInt(kat)         : null,
            isinma_tipi    || null,   // Örn: 'Kombi', 'Doğalgaz'
            enlem          ? parseFloat(enlem)     : null,
            boylam         ? parseFloat(boylam)    : null,
            ai_aciklama    || null,
            dukkan_id,                // Token'dan otomatik
        ]
    );

    // --- 6. Başarılı yanıt ---
    return res.status(201).json({
        basarili: true,
        mesaj: 'İlan başarıyla oluşturuldu.',
        ilan: yeniIlan.rows[0],
    });
};

// ----------------------------------------------------------------
// TÜM İLANLARI GETİR (Get All Listings)
// GET /api/ilanlar
// Herkese açık (tokenDogrula gerekmez)
// ----------------------------------------------------------------
const ilanlariGetir = async (req, res) => {
    const { sehir, min_fiyat, max_fiyat, oda_sayisi, limit = 20, sayfa = 1 } = req.query;

    // Dinamik WHERE koşulları
    const kosullar = [];
    const params   = [];
    let   paramSayac = 1;

    if (min_fiyat) {
        kosullar.push(`fiyat >= $${paramSayac++}`);
        params.push(parseFloat(min_fiyat));
    }
    if (max_fiyat) {
        kosullar.push(`fiyat <= $${paramSayac++}`);
        params.push(parseFloat(max_fiyat));
    }
    if (oda_sayisi) {
        kosullar.push(`oda_sayisi = $${paramSayac++}`);
        params.push(oda_sayisi);
    }

    const whereClause = kosullar.length > 0 ? `WHERE ${kosullar.join(' AND ')}` : '';

    // Sayfalama
    const limitSayi  = Math.min(parseInt(limit), 100); // Max 100 kayıt
    const offset     = (parseInt(sayfa) - 1) * limitSayi;
    params.push(limitSayi, offset);

    const ilanlar = await sorgu(
        `SELECT i.*, d.dukkan_adi, d.sehir, d.ilce
         FROM ilanlar i
         JOIN dukkanlar d ON i.dukkan_id = d.id
         ${whereClause}
         ORDER BY i.olusturulma_tarihi DESC
         LIMIT $${paramSayac++} OFFSET $${paramSayac}`,
        params
    );

    return res.status(200).json({
        basarili: true,
        toplam:   ilanlar.rows.length,
        sayfa:    parseInt(sayfa),
        ilanlar:  ilanlar.rows,
    });
};

// ----------------------------------------------------------------
// TEK İLAN GETİR (Get Single Listing)
// GET /api/ilanlar/:id
// ----------------------------------------------------------------
const ilanGetir = async (req, res) => {
    const { id } = req.params;

    const sonuc = await sorgu(
        `SELECT i.*, d.dukkan_adi, d.sehir, d.ilce, d.vergi_no
         FROM ilanlar i
         JOIN dukkanlar d ON i.dukkan_id = d.id
         WHERE i.id = $1`,
        [id]
    );

    if (sonuc.rows.length === 0) {
        return res.status(404).json({
            basarili: false,
            mesaj: 'İlan bulunamadı.',
        });
    }

    return res.status(200).json({
        basarili: true,
        ilan: sonuc.rows[0],
    });
};

// ----------------------------------------------------------------
// İLAN GÜNCELLE (Update Listing)
// PUT /api/ilanlar/:id
// Korumalı: Sadece ilanın sahibi dükkan veya admin güncelleyebilir
// ----------------------------------------------------------------
const ilanGuncelle = async (req, res) => {
    const { id } = req.params;
    const { rol, dukkan_id } = req.kullanici;

    // --- 1. İlan var mı ve kime ait? ---
    const mevcutIlan = await sorgu(
        'SELECT id, dukkan_id FROM ilanlar WHERE id = $1',
        [id]
    );

    if (mevcutIlan.rows.length === 0) {
        return res.status(404).json({
            basarili: false,
            mesaj: 'İlan bulunamadı.',
        });
    }

    // --- 2. Yetki kontrolü: Kendi dükkanının ilanı mı, yoksa admin mi? ---
    const ilanSahibiDukkan = mevcutIlan.rows[0].dukkan_id;
    if (rol !== 'admin' && ilanSahibiDukkan !== dukkan_id) {
        return res.status(403).json({
            basarili: false,
            mesaj: 'Bu ilanı güncelleme yetkiniz yok. Sadece ilanı ekleyen ofis güncelleyebilir.',
        });
    }

    // --- 3. Güncellenecek alanları al (sadece gönderilenleri güncelle) ---
    const {
        baslik,
        aciklama,
        fiyat,
        metrekare,
        oda_sayisi,
        bina_yasi,
        kat,
        isinma_tipi,
        enlem,
        boylam,
        ai_aciklama,
    } = req.body;

    // En az bir alan gönderilmeli
    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({
            basarili: false,
            mesaj: 'Güncellenecek en az bir alan gönderilmelidir.',
        });
    }

    // --- 4. Dinamik SET bloğu oluştur (sadece gönderilen alanlar güncellenir) ---
    const guncellemeler = [];
    const params        = [];
    let   paramSayac    = 1;

    const alanEkle = (isim, deger, tip = 'string') => {
        if (deger !== undefined) {
            guncellemeler.push(`${isim} = $${paramSayac++}`);
            if (tip === 'float')   params.push(parseFloat(deger));
            else if (tip === 'int') params.push(parseInt(deger));
            else                   params.push(deger);
        }
    };

    alanEkle('baslik',      baslik);
    alanEkle('aciklama',    aciklama);
    alanEkle('fiyat',       fiyat,       'float');
    alanEkle('metrekare',   metrekare,   'float');
    alanEkle('oda_sayisi',  oda_sayisi);
    alanEkle('bina_yasi',   bina_yasi,   'int');
    alanEkle('kat',         kat,         'int');
    alanEkle('isinma_tipi', isinma_tipi);
    alanEkle('enlem',       enlem,       'float');
    alanEkle('boylam',      boylam,      'float');
    alanEkle('ai_aciklama', ai_aciklama);

    params.push(id); // WHERE id = $N

    const guncellenenIlan = await sorgu(
        `UPDATE ilanlar
         SET ${guncellemeler.join(', ')}
         WHERE id = $${paramSayac}
         RETURNING *`,
        params
    );

    return res.status(200).json({
        basarili: true,
        mesaj: 'İlan başarıyla güncellendi.',
        ilan: guncellenenIlan.rows[0],
    });
};

// ----------------------------------------------------------------
// İLAN SİL (Delete Listing)
// DELETE /api/ilanlar/:id
// Korumalı: Sadece ilanın sahibi dükkan veya admin silebilir
// ----------------------------------------------------------------
const ilanSil = async (req, res) => {
    const { id } = req.params;
    const { rol, dukkan_id } = req.kullanici;

    // --- 1. İlan var mı? ---
    const mevcutIlan = await sorgu(
        'SELECT id, baslik, dukkan_id FROM ilanlar WHERE id = $1',
        [id]
    );

    if (mevcutIlan.rows.length === 0) {
        return res.status(404).json({
            basarili: false,
            mesaj: 'İlan bulunamadı.',
        });
    }

    // --- 2. Yetki kontrolü ---
    const ilanSahibiDukkan = mevcutIlan.rows[0].dukkan_id;
    if (rol !== 'admin' && ilanSahibiDukkan !== dukkan_id) {
        return res.status(403).json({
            basarili: false,
            mesaj: 'Bu ilanı silme yetkiniz yok. Sadece ilanı ekleyen ofis silebilir.',
        });
    }

    // --- 3. Sil ---
    await sorgu('DELETE FROM ilanlar WHERE id = $1', [id]);

    return res.status(200).json({
        basarili: true,
        mesaj: `"${mevcutIlan.rows[0].baslik}" ilanı başarıyla silindi.`,
    });
};

module.exports = { ilanEkle, ilanlariGetir, ilanGetir, ilanGuncelle, ilanSil };

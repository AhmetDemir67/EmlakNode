'use strict';

const { sorgu } = require('../config/db');

// ----------------------------------------------------------------
// İLAN EKLE (Create Listing)
// POST /api/ilanlar
// Korumalı: tokenDogrula middleware gerekli
// ----------------------------------------------------------------
const ilanEkle = async (req, res) => {
    // --- 1. Token'dan kullanıcı bilgilerini al ---
    const { id: kullanici_id, dukkan_id, rol } = req.kullanici;

    // --- 1b. Bireysel kullanıcı ilan limiti kontrolü (max 3) ---
    if (!dukkan_id && rol !== 'admin') {
        const sayimSonuc = await sorgu(
            'SELECT COUNT(*) FROM ilanlar WHERE kullanici_id = $1',
            [kullanici_id]
        );
        if (parseInt(sayimSonuc.rows[0].count) >= 3) {
            return res.status(403).json({
                basarili:    false,
                limit_asimi: true,
                mesaj:       'Bireysel hesaplar en fazla 3 ilan ekleyebilir. Daha fazla ilan vermek için bir emlak ofisiyle çalışmanız gerekmektedir.',
            });
        }
    }

    // --- 2. İstek gövdesinden alanları al ---
    const {
        baslik,
        aciklama,
        fiyat,
        tip,
        emlak_turu,
        metrekare,
        oda_sayisi,
        bina_yasi,
        kat,
        toplam_kat,
        isinma_tipi,
        banyo_sayisi,
        balkon,
        asansor,
        otopark,
        esyali,
        site_icerisinde,
        sehir,
        ilce,
        mahalle,
        enlem,
        boylam,
        gorsel,
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
    const yeniIlan = await sorgu(
        `INSERT INTO ilanlar
            (baslik, aciklama, fiyat, tip, emlak_turu, metrekare, oda_sayisi, bina_yasi,
             kat, toplam_kat, isinma_tipi, banyo_sayisi, balkon, asansor, otopark,
             esyali, site_icerisinde, sehir, ilce, mahalle, enlem, boylam, gorsel,
             ai_aciklama, dukkan_id, kullanici_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26)
         RETURNING *`,
        [
            baslik.trim(),
            aciklama            || null,
            parseFloat(fiyat),
            tip                 || 'Satılık',
            emlak_turu          || 'Daire',
            parseFloat(metrekare),
            oda_sayisi          || null,
            bina_yasi           ? parseInt(bina_yasi)   : null,
            kat                 ? parseInt(kat)          : null,
            toplam_kat          ? parseInt(toplam_kat)   : null,
            isinma_tipi         || null,
            banyo_sayisi        ? parseInt(banyo_sayisi) : null,
            balkon              === true || balkon === 'true' ? true : false,
            asansor             === true || asansor === 'true' ? true : false,
            otopark             === true || otopark === 'true' ? true : false,
            esyali              === true || esyali === 'true' ? true : false,
            site_icerisinde     === true || site_icerisinde === 'true' ? true : false,
            sehir               || null,
            ilce                || null,
            mahalle             || null,
            enlem               ? parseFloat(enlem)      : null,
            boylam              ? parseFloat(boylam)     : null,
            gorsel              || null,
            ai_aciklama         || null,
            dukkan_id           || null,
            kullanici_id,
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
    const {
        sehir, ilce, min_fiyat, max_fiyat, oda_sayisi, tip, emlak_turu,
        dukkan_id, kullanici_id, min_metrekare, max_metrekare, arama, limit = 50, sayfa = 1,
    } = req.query;

    const kosullar = [];
    const params   = [];
    let   paramSayac = 1;

    if (min_fiyat)     { kosullar.push(`i.fiyat >= $${paramSayac++}`);      params.push(parseFloat(min_fiyat)); }
    if (max_fiyat)     { kosullar.push(`i.fiyat <= $${paramSayac++}`);      params.push(parseFloat(max_fiyat)); }
    if (min_metrekare) { kosullar.push(`i.metrekare >= $${paramSayac++}`);  params.push(parseFloat(min_metrekare)); }
    if (max_metrekare) { kosullar.push(`i.metrekare <= $${paramSayac++}`);  params.push(parseFloat(max_metrekare)); }
    if (oda_sayisi)    { kosullar.push(`i.oda_sayisi = $${paramSayac++}`);  params.push(oda_sayisi); }
    if (tip)           { kosullar.push(`i.tip = $${paramSayac++}`);         params.push(tip); }
    if (emlak_turu)    { kosullar.push(`i.emlak_turu = $${paramSayac++}`);  params.push(emlak_turu); }
    if (sehir)         { kosullar.push(`(i.sehir ILIKE $${paramSayac} OR d.sehir ILIKE $${paramSayac})`); params.push(`%${sehir}%`); paramSayac++; }
    if (ilce)          { kosullar.push(`i.ilce ILIKE $${paramSayac++}`);    params.push(`%${ilce}%`); }
    if (dukkan_id)     { kosullar.push(`i.dukkan_id = $${paramSayac++}`);   params.push(parseInt(dukkan_id)); }
    if (kullanici_id)  { kosullar.push(`i.kullanici_id = $${paramSayac++}`); params.push(parseInt(kullanici_id)); }
    if (arama)         { kosullar.push(`(i.baslik ILIKE $${paramSayac} OR i.aciklama ILIKE $${paramSayac})`); params.push(`%${arama}%`); paramSayac++; }

    const whereClause = kosullar.length > 0 ? `WHERE ${kosullar.join(' AND ')}` : '';
    const limitSayi   = Math.min(parseInt(limit), 100);
    const offset      = (parseInt(sayfa) - 1) * limitSayi;
    params.push(limitSayi, offset);

    const ilanlar = await sorgu(
        `SELECT i.*, d.dukkan_adi,
                COALESCE(i.sehir, d.sehir) AS sehir,
                COALESCE(i.ilce, d.ilce)   AS ilce
         FROM ilanlar i
         LEFT JOIN dukkanlar d ON i.dukkan_id = d.id
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
        `SELECT i.*, d.dukkan_adi, d.sehir AS dukkan_sehir, d.ilce AS dukkan_ilce, d.vergi_no
         FROM ilanlar i
         LEFT JOIN dukkanlar d ON i.dukkan_id = d.id
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
    const { id: kullanici_id, rol, dukkan_id } = req.kullanici;

    // --- 1. İlan var mı ve kime ait? ---
    const mevcutIlan = await sorgu(
        'SELECT id, dukkan_id, kullanici_id FROM ilanlar WHERE id = $1',
        [id]
    );

    if (mevcutIlan.rows.length === 0) {
        return res.status(404).json({ basarili: false, mesaj: 'İlan bulunamadı.' });
    }

    // --- 2. Yetki: admin, ilanın sahibi kullanıcı veya aynı dükkan ---
    const ilan = mevcutIlan.rows[0];
    const sahibi = ilan.kullanici_id === kullanici_id || (dukkan_id && ilan.dukkan_id === dukkan_id);
    if (rol !== 'admin' && !sahibi) {
        return res.status(403).json({
            basarili: false,
            mesaj: 'Bu ilanı güncelleme yetkiniz yok.',
        });
    }

    // --- 3. Güncellenecek alanları al (sadece gönderilenleri güncelle) ---
    const {
        baslik, aciklama, fiyat, tip, emlak_turu,
        metrekare, oda_sayisi, bina_yasi, kat, toplam_kat,
        isinma_tipi, banyo_sayisi, balkon, asansor, otopark,
        esyali, site_icerisinde, sehir, ilce, mahalle,
        enlem, boylam, gorsel, ai_aciklama,
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

    alanEkle('baslik',           baslik);
    alanEkle('aciklama',         aciklama);
    alanEkle('fiyat',            fiyat,       'float');
    alanEkle('tip',              tip);
    alanEkle('emlak_turu',       emlak_turu);
    alanEkle('metrekare',        metrekare,   'float');
    alanEkle('oda_sayisi',       oda_sayisi);
    alanEkle('bina_yasi',        bina_yasi,   'int');
    alanEkle('kat',              kat,         'int');
    alanEkle('toplam_kat',       toplam_kat,  'int');
    alanEkle('isinma_tipi',      isinma_tipi);
    alanEkle('banyo_sayisi',     banyo_sayisi,'int');
    alanEkle('balkon',           balkon);
    alanEkle('asansor',          asansor);
    alanEkle('otopark',          otopark);
    alanEkle('esyali',           esyali);
    alanEkle('site_icerisinde',  site_icerisinde);
    alanEkle('sehir',            sehir);
    alanEkle('ilce',             ilce);
    alanEkle('mahalle',          mahalle);
    alanEkle('enlem',            enlem,       'float');
    alanEkle('boylam',           boylam,      'float');
    alanEkle('gorsel',           gorsel);
    alanEkle('ai_aciklama',      ai_aciklama);

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
    const { id: kullanici_id, rol, dukkan_id } = req.kullanici;

    // --- 1. İlan var mı? ---
    const mevcutIlan = await sorgu(
        'SELECT id, baslik, dukkan_id, kullanici_id FROM ilanlar WHERE id = $1',
        [id]
    );

    if (mevcutIlan.rows.length === 0) {
        return res.status(404).json({ basarili: false, mesaj: 'İlan bulunamadı.' });
    }

    // --- 2. Yetki: admin, ilanın sahibi kullanıcı veya aynı dükkan ---
    const ilan = mevcutIlan.rows[0];
    const sahibi = ilan.kullanici_id === kullanici_id || (dukkan_id && ilan.dukkan_id === dukkan_id);
    if (rol !== 'admin' && !sahibi) {
        return res.status(403).json({
            basarili: false,
            mesaj: 'Bu ilanı silme yetkiniz yok.',
        });
    }

    // --- 3. Sil ---
    await sorgu('DELETE FROM ilanlar WHERE id = $1', [id]);

    return res.status(200).json({
        basarili: true,
        mesaj: `"${mevcutIlan.rows[0].baslik}" ilanı başarıyla silindi.`,
    });
};

// ----------------------------------------------------------------
// İLAN DURUM GÜNCELLE (Patch Status)
// PATCH /api/ilanlar/:id/durum
// Korumalı: Sadece ilanın sahibi dükkan veya admin güncelleyebilir
// ----------------------------------------------------------------
const GECERLI_DURUMLAR = ['aktif', 'pasif', 'satildi', 'kiralandı'];

const ilanDurumGuncelle = async (req, res) => {
    const { id }     = req.params;
    const { durum }  = req.body;
    const { rol, dukkan_id } = req.kullanici;

    if (!durum || !GECERLI_DURUMLAR.includes(durum)) {
        return res.status(400).json({
            basarili: false,
            mesaj: `Geçerli durum değerleri: ${GECERLI_DURUMLAR.join(', ')}`,
        });
    }

    const mevcutIlan = await sorgu(
        'SELECT id, dukkan_id FROM ilanlar WHERE id = $1',
        [id]
    );

    if (mevcutIlan.rows.length === 0) {
        return res.status(404).json({ basarili: false, mesaj: 'İlan bulunamadı.' });
    }

    if (rol !== 'admin' && mevcutIlan.rows[0].dukkan_id !== dukkan_id) {
        return res.status(403).json({ basarili: false, mesaj: 'Bu ilanı güncelleme yetkiniz yok.' });
    }

    const guncellenen = await sorgu(
        'UPDATE ilanlar SET durum = $1 WHERE id = $2 RETURNING id, baslik, durum',
        [durum, id]
    );

    return res.status(200).json({
        basarili: true,
        mesaj: 'İlan durumu güncellendi.',
        ilan: guncellenen.rows[0],
    });
};

module.exports = { ilanEkle, ilanlariGetir, ilanGetir, ilanGuncelle, ilanSil, ilanDurumGuncelle };

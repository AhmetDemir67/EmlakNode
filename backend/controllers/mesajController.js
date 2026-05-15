'use strict';

const { sorgu } = require('../config/db');

// GET /api/mesajlar  — Giriş yapan kullanıcının tüm konuşmaları
const konusmalariGetir = async (req, res) => {
  try {
    const { id: kullanici_id } = req.kullanici;

    const sonuc = await sorgu(
      `SELECT
         k.id,
         k.ilan_id,
         i.baslik      AS ilan_baslik,
         i.gorsel      AS ilan_gorsel,
         CASE WHEN k.gonderen_id = $1 THEN k.alici_id    ELSE k.gonderen_id    END AS karsi_id,
         CASE WHEN k.gonderen_id = $1 THEN al.ad_soyad   ELSE gon.ad_soyad    END AS karsi_ad,
         k.olusturulma,
         (SELECT metin       FROM mesajlar WHERE konusma_id = k.id ORDER BY olusturulma DESC LIMIT 1) AS son_mesaj,
         (SELECT olusturulma FROM mesajlar WHERE konusma_id = k.id ORDER BY olusturulma DESC LIMIT 1) AS son_tarih,
         (SELECT COUNT(*)    FROM mesajlar WHERE konusma_id = k.id AND okundu = FALSE AND gonderen_id <> $1) AS okunmamis
       FROM konusmalar k
       JOIN kullanicilar gon ON k.gonderen_id = gon.id
       JOIN kullanicilar al  ON k.alici_id    = al.id
       LEFT JOIN ilanlar i   ON k.ilan_id     = i.id
       WHERE k.gonderen_id = $1 OR k.alici_id = $1
       ORDER BY son_tarih DESC NULLS LAST`,
      [kullanici_id]
    );

    return res.json({ basarili: true, konusmalar: sonuc.rows });
  } catch (err) {
    console.error('konusmalariGetir hata:', err.message);
    return res.status(500).json({ basarili: false, mesaj: 'Sunucu hatası.' });
  }
};

// GET /api/mesajlar/:konusmaId  — Belirli konuşmanın mesajları
const mesajlariGetir = async (req, res) => {
  try {
    const { id: kullanici_id } = req.kullanici;
    const { konusmaId } = req.params;

    // Yetki: kullanıcı bu konuşmada mı?
    const konusma = await sorgu(
      'SELECT * FROM konusmalar WHERE id = $1 AND (gonderen_id = $2 OR alici_id = $2)',
      [konusmaId, kullanici_id]
    );
    if (konusma.rows.length === 0) {
      return res.status(403).json({ basarili: false, mesaj: 'Bu konuşmaya erişim yetkiniz yok.' });
    }

    // Okunmamış mesajları okundu yap
    await sorgu(
      'UPDATE mesajlar SET okundu = TRUE WHERE konusma_id = $1 AND gonderen_id <> $2',
      [konusmaId, kullanici_id]
    );

    const sonuc = await sorgu(
      `SELECT m.*, k.ad_soyad AS gonderen_ad
       FROM mesajlar m
       JOIN kullanicilar k ON m.gonderen_id = k.id
       WHERE m.konusma_id = $1
       ORDER BY m.olusturulma ASC`,
      [konusmaId]
    );

    return res.json({ basarili: true, mesajlar: sonuc.rows, konusma: konusma.rows[0] });
  } catch (err) {
    console.error('mesajlariGetir hata:', err.message);
    return res.status(500).json({ basarili: false, mesaj: 'Sunucu hatası.' });
  }
};

// POST /api/mesajlar  — Yeni mesaj / konuşma başlat
const mesajGonder = async (req, res) => {
  try {
    const { id: gonderen_id } = req.kullanici;
    const { alici_id, ilan_id, metin } = req.body;

    if (!alici_id || !metin?.trim()) {
      return res.status(400).json({ basarili: false, mesaj: 'alici_id ve metin zorunludur.' });
    }
    if (parseInt(alici_id) === parseInt(gonderen_id)) {
      return res.status(400).json({ basarili: false, mesaj: 'Kendinize mesaj gönderemezsiniz.' });
    }

    // Var olan konuşmayı bul veya yeni oluştur
    let konusma = await sorgu(
      `SELECT id FROM konusmalar
       WHERE ilan_id IS NOT DISTINCT FROM $1
         AND ((gonderen_id = $2 AND alici_id = $3) OR (gonderen_id = $3 AND alici_id = $2))
       LIMIT 1`,
      [ilan_id || null, gonderen_id, parseInt(alici_id)]
    );

    if (konusma.rows.length === 0) {
      konusma = await sorgu(
        'INSERT INTO konusmalar (ilan_id, gonderen_id, alici_id) VALUES ($1, $2, $3) RETURNING *',
        [ilan_id || null, gonderen_id, parseInt(alici_id)]
      );
    }

    const konusmaId = konusma.rows[0].id;
    const yeniMesaj = await sorgu(
      'INSERT INTO mesajlar (konusma_id, gonderen_id, metin) VALUES ($1, $2, $3) RETURNING *',
      [konusmaId, gonderen_id, metin.trim()]
    );

    // Alıcıya bildirim oluştur
    try {
      const gonderenAd = req.kullanici.ad_soyad || 'Biri';
      await sorgu(
        `INSERT INTO bildirimler (kullanici_id, tip, baslik, icerik, ilan_id, konusma_id)
         VALUES ($1, 'mesaj', $2, $3, $4, $5)`,
        [parseInt(alici_id), 'Yeni Mesaj', `${gonderenAd} size mesaj gönderdi`, ilan_id || null, konusmaId]
      );
    } catch {}

    return res.status(201).json({ basarili: true, mesaj: yeniMesaj.rows[0], konusma_id: konusmaId });
  } catch (err) {
    console.error('mesajGonder hata:', err.message);
    return res.status(500).json({ basarili: false, mesaj: 'Sunucu hatası.' });
  }
};

// GET /api/mesajlar/okunmamis  — Okunmamış mesaj sayısı
const okunmamisSayisi = async (req, res) => {
  try {
    const { id: kullanici_id } = req.kullanici;

    const sonuc = await sorgu(
      `SELECT COUNT(*) AS sayi
       FROM mesajlar m
       JOIN konusmalar k ON m.konusma_id = k.id
       WHERE (k.gonderen_id = $1 OR k.alici_id = $1)
         AND m.gonderen_id <> $1
         AND m.okundu = FALSE`,
      [kullanici_id]
    );

    return res.json({ basarili: true, sayi: parseInt(sonuc.rows[0].sayi) });
  } catch (err) {
    return res.status(500).json({ basarili: false, mesaj: 'Sunucu hatası.' });
  }
};

module.exports = { konusmalariGetir, mesajlariGetir, mesajGonder, okunmamisSayisi };

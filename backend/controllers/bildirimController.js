'use strict';

const { sorgu } = require('../config/db');

const bildirimleriGetir = async (req, res) => {
  try {
    const { id: kullanici_id } = req.kullanici;
    const sonuc = await sorgu(
      `SELECT b.*, i.baslik AS ilan_baslik
       FROM bildirimler b
       LEFT JOIN ilanlar i ON b.ilan_id = i.id
       WHERE b.kullanici_id = $1
       ORDER BY b.olusturulma DESC
       LIMIT 50`,
      [kullanici_id]
    );
    return res.json({ basarili: true, bildirimler: sonuc.rows });
  } catch (err) {
    console.error('bildirimleriGetir hata:', err.message);
    return res.status(500).json({ basarili: false, mesaj: 'Sunucu hatası.' });
  }
};

const okunmamisBildirimSayisi = async (req, res) => {
  try {
    const { id: kullanici_id } = req.kullanici;
    const sonuc = await sorgu(
      'SELECT COUNT(*) AS sayi FROM bildirimler WHERE kullanici_id = $1 AND okundu = FALSE',
      [kullanici_id]
    );
    return res.json({ basarili: true, sayi: parseInt(sonuc.rows[0].sayi) });
  } catch (err) {
    return res.status(500).json({ basarili: false, mesaj: 'Sunucu hatası.' });
  }
};

const bildirimOku = async (req, res) => {
  try {
    const { id: kullanici_id } = req.kullanici;
    const { id } = req.params;
    await sorgu(
      'UPDATE bildirimler SET okundu = TRUE WHERE id = $1 AND kullanici_id = $2',
      [id, kullanici_id]
    );
    return res.json({ basarili: true });
  } catch (err) {
    return res.status(500).json({ basarili: false, mesaj: 'Sunucu hatası.' });
  }
};

const hepsiniOku = async (req, res) => {
  try {
    const { id: kullanici_id } = req.kullanici;
    await sorgu(
      'UPDATE bildirimler SET okundu = TRUE WHERE kullanici_id = $1',
      [kullanici_id]
    );
    return res.json({ basarili: true });
  } catch (err) {
    return res.status(500).json({ basarili: false, mesaj: 'Sunucu hatası.' });
  }
};

module.exports = { bildirimleriGetir, okunmamisBildirimSayisi, bildirimOku, hepsiniOku };

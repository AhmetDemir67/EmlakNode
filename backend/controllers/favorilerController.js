'use strict';

const { sorgu } = require('../config/db');

// ── FAVORİLER ──────────────────────────────────────────────────────

const favorilerGetir = async (req, res) => {
  const { id } = req.kullanici;
  const sonuc = await sorgu(
    `SELECT f.id AS favori_id, f.olusturulma_tarihi AS favori_tarihi, i.*
     FROM favoriler f
     JOIN ilanlar i ON i.id = f.ilan_id
     WHERE f.kullanici_id = $1
     ORDER BY f.olusturulma_tarihi DESC`,
    [id]
  );
  return res.json({ basarili: true, favoriler: sonuc.rows });
};

const favoriEkle = async (req, res) => {
  const { id } = req.kullanici;
  const { ilan_id } = req.body;
  if (!ilan_id) return res.status(400).json({ basarili: false, mesaj: 'ilan_id zorunlu.' });

  await sorgu(
    'INSERT INTO favoriler (kullanici_id, ilan_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [id, ilan_id]
  );
  return res.json({ basarili: true, mesaj: 'Favorilere eklendi.' });
};

const favoriSil = async (req, res) => {
  const { id } = req.kullanici;
  const { ilan_id } = req.params;
  await sorgu(
    'DELETE FROM favoriler WHERE kullanici_id = $1 AND ilan_id = $2',
    [id, ilan_id]
  );
  return res.json({ basarili: true, mesaj: 'Favorilerden çıkarıldı.' });
};

const favoriKontrol = async (req, res) => {
  const { id } = req.kullanici;
  const { ilan_id } = req.params;
  const sonuc = await sorgu(
    'SELECT id FROM favoriler WHERE kullanici_id = $1 AND ilan_id = $2',
    [id, ilan_id]
  );
  return res.json({ basarili: true, favori: sonuc.rows.length > 0 });
};

// ── KAYITLI ARAMALAR ───────────────────────────────────────────────

const kayitliAramalarGetir = async (req, res) => {
  const { id } = req.kullanici;
  const sonuc = await sorgu(
    'SELECT * FROM kayitli_aramalar WHERE kullanici_id = $1 ORDER BY olusturulma_tarihi DESC',
    [id]
  );
  return res.json({ basarili: true, aramalar: sonuc.rows });
};

const kayitliAramaEkle = async (req, res) => {
  const { id } = req.kullanici;
  const { baslik, filtreler } = req.body;
  if (!baslik) return res.status(400).json({ basarili: false, mesaj: 'baslik zorunlu.' });

  const sonuc = await sorgu(
    'INSERT INTO kayitli_aramalar (kullanici_id, baslik, filtreler) VALUES ($1, $2, $3) RETURNING *',
    [id, baslik.trim(), JSON.stringify(filtreler || {})]
  );
  return res.status(201).json({ basarili: true, arama: sonuc.rows[0] });
};

const kayitliAramaSil = async (req, res) => {
  const { id } = req.kullanici;
  const { arama_id } = req.params;
  await sorgu(
    'DELETE FROM kayitli_aramalar WHERE id = $1 AND kullanici_id = $2',
    [arama_id, id]
  );
  return res.json({ basarili: true, mesaj: 'Arama silindi.' });
};

// ── KAYITLI ADRESLER ───────────────────────────────────────────────

const kayitliAdreslerGetir = async (req, res) => {
  const { id } = req.kullanici;
  const sonuc = await sorgu(
    'SELECT * FROM kayitli_adresler WHERE kullanici_id = $1 ORDER BY olusturulma_tarihi DESC',
    [id]
  );
  return res.json({ basarili: true, adresler: sonuc.rows });
};

const kayitliAdresEkle = async (req, res) => {
  const { id } = req.kullanici;
  const { baslik, adres, sehir, ilce, enlem, boylam } = req.body;
  if (!baslik) return res.status(400).json({ basarili: false, mesaj: 'baslik zorunlu.' });

  const sonuc = await sorgu(
    `INSERT INTO kayitli_adresler (kullanici_id, baslik, adres, sehir, ilce, enlem, boylam)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [id, baslik.trim(), adres || null, sehir || null, ilce || null, enlem || null, boylam || null]
  );
  return res.status(201).json({ basarili: true, adres: sonuc.rows[0] });
};

const kayitliAdresSil = async (req, res) => {
  const { id } = req.kullanici;
  const { adres_id } = req.params;
  await sorgu(
    'DELETE FROM kayitli_adresler WHERE id = $1 AND kullanici_id = $2',
    [adres_id, id]
  );
  return res.json({ basarili: true, mesaj: 'Adres silindi.' });
};

module.exports = {
  favorilerGetir, favoriEkle, favoriSil, favoriKontrol,
  kayitliAramalarGetir, kayitliAramaEkle, kayitliAramaSil,
  kayitliAdreslerGetir, kayitliAdresEkle, kayitliAdresSil,
};

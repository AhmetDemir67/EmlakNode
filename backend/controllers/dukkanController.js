'use strict';

const { sorgu } = require('../config/db');

// GET /api/dukkanlar/:id
const dukkanGetir = async (req, res) => {
  try {
    const { id } = req.params;
    const { dukkan_id, rol } = req.kullanici;
    if (parseInt(dukkan_id) !== parseInt(id) && rol !== 'admin')
      return res.status(403).json({ basarili: false, mesaj: 'Yetkisiz erişim.' });

    const sonuc = await sorgu('SELECT * FROM dukkanlar WHERE id = $1', [id]);
    if (!sonuc.rows.length)
      return res.status(404).json({ basarili: false, mesaj: 'Dükkan bulunamadı.' });

    return res.json({ basarili: true, dukkan: sonuc.rows[0] });
  } catch (err) {
    console.error('dukkanGetir:', err.message);
    return res.status(500).json({ basarili: false, mesaj: 'Sunucu hatası.' });
  }
};

// PUT /api/dukkanlar/:id
const dukkanGuncelle = async (req, res) => {
  try {
    const { id } = req.params;
    const { dukkan_id, rol } = req.kullanici;
    if (parseInt(dukkan_id) !== parseInt(id) && rol !== 'admin')
      return res.status(403).json({ basarili: false, mesaj: 'Yetkisiz erişim.' });

    const { dukkan_adi, sehir, ilce } = req.body;
    const sonuc = await sorgu(
      `UPDATE dukkanlar SET
         dukkan_adi = COALESCE($1, dukkan_adi),
         sehir      = COALESCE($2, sehir),
         ilce       = COALESCE($3, ilce)
       WHERE id = $4 RETURNING *`,
      [dukkan_adi || null, sehir || null, ilce || null, id]
    );
    return res.json({ basarili: true, mesaj: 'Dükkan bilgileri güncellendi.', dukkan: sonuc.rows[0] });
  } catch (err) {
    console.error('dukkanGuncelle:', err.message);
    return res.status(500).json({ basarili: false, mesaj: 'Sunucu hatası.' });
  }
};

// GET /api/dukkanlar/:id/danismanlar
const danismanlarGetir = async (req, res) => {
  try {
    const { id } = req.params;
    const { dukkan_id, rol } = req.kullanici;
    if (parseInt(dukkan_id) !== parseInt(id) && rol !== 'admin')
      return res.status(403).json({ basarili: false, mesaj: 'Yetkisiz erişim.' });

    const sonuc = await sorgu(
      `SELECT k.id, k.ad_soyad, k.eposta, k.rol, k.olusturulma_tarihi,
              COUNT(i.id)::int AS ilan_sayisi
       FROM kullanicilar k
       LEFT JOIN ilanlar i ON i.kullanici_id = k.id
       WHERE k.dukkan_id = $1
       GROUP BY k.id
       ORDER BY CASE k.rol WHEN 'patron' THEN 0 ELSE 1 END, k.ad_soyad`,
      [id]
    );
    return res.json({ basarili: true, danismanlar: sonuc.rows });
  } catch (err) {
    console.error('danismanlarGetir:', err.message);
    return res.status(500).json({ basarili: false, mesaj: 'Sunucu hatası.' });
  }
};

// GET /api/dukkanlar/:id/istatistikler
const istatistiklerGetir = async (req, res) => {
  try {
    const { id } = req.params;
    const { dukkan_id, rol } = req.kullanici;
    if (parseInt(dukkan_id) !== parseInt(id) && rol !== 'admin')
      return res.status(403).json({ basarili: false, mesaj: 'Yetkisiz erişim.' });

    const [ilanlar, kisiler] = await Promise.all([
      sorgu(
        `SELECT
           COUNT(*)::int                                             AS toplam,
           COUNT(CASE WHEN durum = 'aktif'   THEN 1 END)::int       AS aktif,
           COUNT(CASE WHEN durum = 'pasif'   THEN 1 END)::int       AS pasif,
           COUNT(CASE WHEN durum = 'satildi' THEN 1 END)::int       AS satildi,
           COUNT(CASE WHEN onceki_fiyat IS NOT NULL THEN 1 END)::int AS fiyat_dustu,
           COUNT(CASE WHEN tip = 'Satılık'  THEN 1 END)::int        AS satilik,
           COUNT(CASE WHEN tip = 'Kiralık'  THEN 1 END)::int        AS kiralik
         FROM ilanlar WHERE dukkan_id = $1`,
        [id]
      ),
      sorgu('SELECT COUNT(*)::int AS sayi FROM kullanicilar WHERE dukkan_id = $1', [id]),
    ]);

    return res.json({
      basarili: true,
      istatistikler: { ...ilanlar.rows[0], danismanlar: kisiler.rows[0].sayi },
    });
  } catch (err) {
    console.error('istatistiklerGetir:', err.message);
    return res.status(500).json({ basarili: false, mesaj: 'Sunucu hatası.' });
  }
};

// POST /api/dukkanlar/:id/danismanlar
const danismanEkle = async (req, res) => {
  try {
    const { id } = req.params;
    const { dukkan_id, rol } = req.kullanici;
    if (parseInt(dukkan_id) !== parseInt(id) && rol !== 'admin')
      return res.status(403).json({ basarili: false, mesaj: 'Yetkisiz erişim.' });

    const { eposta } = req.body;
    if (!eposta?.trim())
      return res.status(400).json({ basarili: false, mesaj: 'E-posta zorunludur.' });

    const kul = await sorgu('SELECT id, ad_soyad, eposta, dukkan_id FROM kullanicilar WHERE eposta = $1', [eposta.trim().toLowerCase()]);
    if (!kul.rows.length)
      return res.status(404).json({ basarili: false, mesaj: 'Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı.' });

    const k = kul.rows[0];
    if (k.dukkan_id)
      return res.status(400).json({ basarili: false, mesaj: 'Bu kullanıcı zaten bir ofise bağlı.' });

    await sorgu('UPDATE kullanicilar SET dukkan_id = $1, rol = $2 WHERE id = $3', [id, 'danisman', k.id]);
    return res.json({ basarili: true, mesaj: `${k.ad_soyad} ekibinize eklendi.` });
  } catch (err) {
    console.error('danismanEkle:', err.message);
    return res.status(500).json({ basarili: false, mesaj: 'Sunucu hatası.' });
  }
};

// DELETE /api/dukkanlar/:id/danismanlar/:kulId
const danismanCikar = async (req, res) => {
  try {
    const { id, kulId } = req.params;
    const { dukkan_id, rol, id: benimId } = req.kullanici;
    if (parseInt(dukkan_id) !== parseInt(id) && rol !== 'admin')
      return res.status(403).json({ basarili: false, mesaj: 'Yetkisiz erişim.' });
    if (parseInt(kulId) === parseInt(benimId))
      return res.status(400).json({ basarili: false, mesaj: 'Kendinizi çıkaramazsınız.' });

    await sorgu('UPDATE kullanicilar SET dukkan_id = NULL, rol = $1 WHERE id = $2 AND dukkan_id = $3', ['bireysel', kulId, id]);
    return res.json({ basarili: true, mesaj: 'Danışman ekipten çıkarıldı.' });
  } catch (err) {
    return res.status(500).json({ basarili: false, mesaj: 'Sunucu hatası.' });
  }
};

module.exports = { dukkanGetir, dukkanGuncelle, danismanlarGetir, istatistiklerGetir, danismanEkle, danismanCikar };

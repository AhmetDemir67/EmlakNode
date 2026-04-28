'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool, sorgu } = require('../config/db');

// Token süresi .env'den alınır, yoksa varsayılan 7 gün
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Şifre hash'leme için kaç tur salt kullanılacak (10-12 arası önerilir)
const SALT_ROUNDS = 10;

// ----------------------------------------------------------------
// KAYIT OL (Register)
// POST /api/auth/kayit
// ----------------------------------------------------------------
const kayitOl = async (req, res) => {
    const { ad_soyad, eposta, sifre, rol, tc_no, dukkan_id } = req.body;

    // --- 1. Zorunlu alan kontrolü ---
    if (!ad_soyad || !eposta || !sifre) {
        return res.status(400).json({
            basarili: false,
            mesaj: 'ad_soyad, eposta ve sifre alanları zorunludur.',
        });
    }

    // --- 2. Geçerli rol kontrolü ---
    const gecerliRoller = ['admin', 'patron', 'danisman', 'musteri'];
    const kullaniciRol = rol || 'musteri'; // Varsayılan rol: musteri
    if (!gecerliRoller.includes(kullaniciRol)) {
        return res.status(400).json({
            basarili: false,
            mesaj: `Geçersiz rol. Geçerli roller: ${gecerliRoller.join(', ')}`,
        });
    }

    // --- 3. Aynı e-posta ile kayıt var mı? ---
    const mevcutKullanici = await sorgu(
        'SELECT id FROM kullanicilar WHERE eposta = $1',
        [eposta.toLowerCase().trim()]
    );

    if (mevcutKullanici.rows.length > 0) {
        return res.status(409).json({
            basarili: false,
            mesaj: 'Bu e-posta adresi zaten kayıtlı.',
        });
    }

    // --- 4. Şifreyi hash'le (asla düz metin kaydetme!) ---
    const sifreHash = await bcrypt.hash(sifre, SALT_ROUNDS);

    // --- 5. Kullanıcıyı veritabanına kaydet ---
    const yeniKullanici = await sorgu(
        `INSERT INTO kullanicilar (ad_soyad, eposta, sifre, rol, tc_no, dukkan_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, ad_soyad, eposta, rol, tc_no, dukkan_id, olusturulma_tarihi`,
        [
            ad_soyad.trim(),
            eposta.toLowerCase().trim(),
            sifreHash,
            kullaniciRol,
            tc_no || null,      // Opsiyonel
            dukkan_id || null,  // Opsiyonel (sadece emlakçılar için)
        ]
    );

    // --- 6. Başarılı yanıt (şifre asla döndürülmez!) ---
    return res.status(201).json({
        basarili: true,
        mesaj: 'Kullanıcı başarıyla oluşturuldu.',
        kullanici: yeniKullanici.rows[0],
    });
};

// ----------------------------------------------------------------
// GİRİŞ YAP (Login)
// POST /api/auth/giris
// ----------------------------------------------------------------
const girisYap = async (req, res) => {
    const { eposta, sifre } = req.body;

    // --- 1. Zorunlu alan kontrolü ---
    if (!eposta || !sifre) {
        return res.status(400).json({
            basarili: false,
            mesaj: 'eposta ve sifre alanları zorunludur.',
        });
    }

    // --- 2. Kullanıcıyı veritabanında ara ---
    // Güvenlik: Şifre hash'i sadece burada çekiliyor, hiçbir zaman istemciye gönderilmiyor
    const sonuc = await sorgu(
        'SELECT id, ad_soyad, eposta, sifre, rol, dukkan_id FROM kullanicilar WHERE eposta = $1',
        [eposta.toLowerCase().trim()]
    );

    if (sonuc.rows.length === 0) {
        // Güvenlik: "kullanıcı bulunamadı" yerine genel mesaj (kullanıcı keşfini engeller)
        return res.status(401).json({
            basarili: false,
            mesaj: 'E-posta veya şifre hatalı.',
        });
    }

    const kullanici = sonuc.rows[0];

    // --- 3. Şifre doğrulama (bcrypt.compare) ---
    const sifreEslesiyor = await bcrypt.compare(sifre, kullanici.sifre);

    if (!sifreEslesiyor) {
        return res.status(401).json({
            basarili: false,
            mesaj: 'E-posta veya şifre hatalı.',
        });
    }

    // --- 4. JWT Token üret ---
    const tokenPayload = {
        id:       kullanici.id,
        ad_soyad: kullanici.ad_soyad,
        rol:      kullanici.rol,
        dukkan_id: kullanici.dukkan_id,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // --- 5. Başarılı yanıt (şifre hash'i asla gönderilmez!) ---
    return res.status(200).json({
        basarili: true,
        mesaj: 'Giriş başarılı.',
        token,
        kullanici: {
            id:        kullanici.id,
            ad_soyad:  kullanici.ad_soyad,
            eposta:    kullanici.eposta,
            rol:       kullanici.rol,
            dukkan_id: kullanici.dukkan_id,
        },
    });
};

// ----------------------------------------------------------------
// KURUMSAL KAYIT (Corporate Register)
// POST /api/auth/kurumsal-kayit
// Emlak ofisi + patron kullanıcısı tek transaction'da oluşturulur
// ----------------------------------------------------------------
const kurumsal_kayitOl = async (req, res) => {
    const {
        ad_soyad, eposta, sifre,
        dukkan_adi, sehir, ilce, vergi_no, yetki_belge_no,
    } = req.body;

    // --- 1. Zorunlu alan kontrolü ---
    if (!ad_soyad || !eposta || !sifre || !dukkan_adi || !sehir || !ilce || !vergi_no || !yetki_belge_no) {
        return res.status(400).json({
            basarili: false,
            mesaj: 'Tüm alanlar zorunludur.',
        });
    }

    if (sifre.length < 6) {
        return res.status(400).json({ basarili: false, mesaj: 'Şifre en az 6 karakter olmalıdır.' });
    }

    // --- 2. Tekil kontroller ---
    const [mevcutKullanici, mevcutVergi, mevcutBelge] = await Promise.all([
        sorgu('SELECT id FROM kullanicilar WHERE eposta = $1', [eposta.toLowerCase().trim()]),
        sorgu('SELECT id FROM dukkanlar WHERE vergi_no = $1',  [vergi_no.trim()]),
        sorgu('SELECT id FROM dukkanlar WHERE yetki_belge_no = $1', [yetki_belge_no.trim()]),
    ]);

    if (mevcutKullanici.rows.length > 0)
        return res.status(409).json({ basarili: false, mesaj: 'Bu e-posta adresi zaten kayıtlı.' });
    if (mevcutVergi.rows.length > 0)
        return res.status(409).json({ basarili: false, mesaj: 'Bu vergi numarası zaten kayıtlı.' });
    if (mevcutBelge.rows.length > 0)
        return res.status(409).json({ basarili: false, mesaj: 'Bu yetki belge numarası zaten kayıtlı.' });

    // --- 3. Şifre hash ---
    const sifreHash = await bcrypt.hash(sifre, SALT_ROUNDS);

    // --- 4. Transaction: önce dükkan, sonra patron kullanıcı ---
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const dukkanSonuc = await client.query(
            `INSERT INTO dukkanlar (dukkan_adi, sehir, ilce, yetki_belge_no, vergi_no)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, dukkan_adi, sehir, ilce`,
            [dukkan_adi.trim(), sehir.trim(), ilce.trim(), yetki_belge_no.trim(), vergi_no.trim()]
        );

        const dukkan = dukkanSonuc.rows[0];

        const kullaniciSonuc = await client.query(
            `INSERT INTO kullanicilar (ad_soyad, eposta, sifre, rol, dukkan_id)
             VALUES ($1, $2, $3, 'patron', $4)
             RETURNING id, ad_soyad, eposta, rol, dukkan_id, olusturulma_tarihi`,
            [ad_soyad.trim(), eposta.toLowerCase().trim(), sifreHash, dukkan.id]
        );

        await client.query('COMMIT');

        return res.status(201).json({
            basarili: true,
            mesaj: 'Kurumsal hesap başarıyla oluşturuldu.',
            kullanici: kullaniciSonuc.rows[0],
            dukkan,
        });
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

module.exports = { kayitOl, girisYap, kurumsal_kayitOl };

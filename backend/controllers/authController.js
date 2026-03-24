'use strict';

const bcrypt = require('bcrypt');
const { sorgu } = require('../config/db');

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

module.exports = { kayitOl };

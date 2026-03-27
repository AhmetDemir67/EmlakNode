'use strict';

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// ----------------------------------------------------------------
// TOKEN DOĞRULAMA MİDDLEWARE'İ
// Korumalı rotalara eklenir: router.get('/profil', tokenDogrula, controller)
//
// İstemci token'ı şu formatta göndermeli:
// Authorization: Bearer <token>
// ----------------------------------------------------------------
const tokenDogrula = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    // --- 1. Header var mı? ---
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            basarili: false,
            mesaj: 'Yetkisiz erişim. Token bulunamadı.',
        });
    }

    // --- 2. "Bearer " ön ekini ayır, sadece token'ı al ---
    const token = authHeader.split(' ')[1];

    // --- 3. Token'ı doğrula ---
    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // Decoded payload'ı req.kullanici'ya ekle, sonraki controller erişebilsin
        req.kullanici = {
            id:        decoded.id,
            ad_soyad:  decoded.ad_soyad,
            rol:       decoded.rol,
            dukkan_id: decoded.dukkan_id,
        };

        next(); // Her şey tamam, devam et
    } catch (err) {
        // Token süresi dolmuş veya geçersiz
        const mesaj = err.name === 'TokenExpiredError'
            ? 'Oturum süreniz doldu. Lütfen tekrar giriş yapın.'
            : 'Geçersiz token.';

        return res.status(403).json({
            basarili: false,
            mesaj,
        });
    }
};

// ----------------------------------------------------------------
// ROL KONTROL MİDDLEWARE'İ (Fabrika fonksiyonu)
// Belirli rollere erişimi kısıtlamak için kullanılır.
//
// Kullanım: router.delete('/ilan/:id', tokenDogrula, rolKontrol('admin', 'patron'), controller)
// ----------------------------------------------------------------
const rolKontrol = (...izinliRoller) => {
    return (req, res, next) => {
        if (!req.kullanici) {
            return res.status(401).json({ basarili: false, mesaj: 'Yetkisiz erişim.' });
        }

        if (!izinliRoller.includes(req.kullanici.rol)) {
            return res.status(403).json({
                basarili: false,
                mesaj: `Bu işlem için yetkiniz yok. Gerekli rol: ${izinliRoller.join(' veya ')}`,
            });
        }

        next();
    };
};

module.exports = { tokenDogrula, rolKontrol };

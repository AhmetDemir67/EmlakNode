'use strict';

const express = require('express');
const router = express.Router();
const { kayitOl, girisYap } = require('../controllers/authController');

// POST /api/auth/kayit  →  Yeni kullanıcı kaydı
router.post('/kayit', kayitOl);

// POST /api/auth/giris  →  Giriş yap, JWT token al
router.post('/giris', girisYap);

// TODO: İleride eklenecekler
// router.post('/cikis',   cikisYap);
// router.get('/profil',   profilGetir);  // authMiddleware ile korunacak

module.exports = router;

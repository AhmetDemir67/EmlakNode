'use strict';

const express = require('express');
const router = express.Router();
const { kayitOl } = require('../controllers/authController');

// POST /api/auth/kayit  →  Yeni kullanıcı kaydı
router.post('/kayit', kayitOl);

// TODO: İleride eklenecekler
// router.post('/giris',       girisYap);
// router.post('/cikis',       cikisYap);
// router.get('/profil',       profilGetir);  // JWT middleware ile korunacak

module.exports = router;

'use strict';

const express = require('express');
const router = express.Router();
const { kayitOl, girisYap, kurumsal_kayitOl } = require('../controllers/authController');

// POST /api/auth/kayit           →  Bireysel kullanıcı kaydı
router.post('/kayit', kayitOl);

// POST /api/auth/kurumsal-kayit  →  Emlak ofisi + patron hesabı (transaction)
router.post('/kurumsal-kayit', kurumsal_kayitOl);

// POST /api/auth/giris           →  Giriş yap, JWT token al
router.post('/giris', girisYap);

module.exports = router;

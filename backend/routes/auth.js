'use strict';

const express = require('express');
const router = express.Router();
const { kayitOl, girisYap, kurumsal_kayitOl, profilGetir, profilGuncelle, sifreGuncelle } = require('../controllers/authController');
const { tokenDogrula } = require('../middleware/authMiddleware');

router.post('/kayit',          kayitOl);
router.post('/kurumsal-kayit', kurumsal_kayitOl);
router.post('/giris',          girisYap);
router.get ('/profil',         tokenDogrula, profilGetir);
router.put ('/profil',         tokenDogrula, profilGuncelle);
router.put ('/sifre',          tokenDogrula, sifreGuncelle);

module.exports = router;

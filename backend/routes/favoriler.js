'use strict';

const express = require('express');
const router  = express.Router();
const { tokenDogrula } = require('../middleware/authMiddleware');
const {
  favorilerGetir, favoriEkle, favoriSil, favoriKontrol,
  kayitliAramalarGetir, kayitliAramaEkle, kayitliAramaSil,
  kayitliAdreslerGetir, kayitliAdresEkle, kayitliAdresSil,
} = require('../controllers/favorilerController');

// Favoriler
router.get   ('/',                tokenDogrula, favorilerGetir);
router.post  ('/',                tokenDogrula, favoriEkle);
router.delete('/:ilan_id',        tokenDogrula, favoriSil);
router.get   ('/kontrol/:ilan_id',tokenDogrula, favoriKontrol);

// Kayıtlı Aramalar
router.get   ('/aramalar',            tokenDogrula, kayitliAramalarGetir);
router.post  ('/aramalar',            tokenDogrula, kayitliAramaEkle);
router.delete('/aramalar/:arama_id',  tokenDogrula, kayitliAramaSil);

// Kayıtlı Adresler
router.get   ('/adresler',            tokenDogrula, kayitliAdreslerGetir);
router.post  ('/adresler',            tokenDogrula, kayitliAdresEkle);
router.delete('/adresler/:adres_id',  tokenDogrula, kayitliAdresSil);

module.exports = router;

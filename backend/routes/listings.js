'use strict';

const express = require('express');
const router  = express.Router();
const { ilanEkle, ilanlariGetir, ilanGetir } = require('../controllers/listingController');
const { tokenDogrula } = require('../middleware/authMiddleware');

// GET  /api/ilanlar         → Tüm ilanları listele (herkese açık)
router.get('/', ilanlariGetir);

// GET  /api/ilanlar/:id     → Tek ilan getir (herkese açık)
router.get('/:id', ilanGetir);

// POST /api/ilanlar         → Yeni ilan ekle (sadece giriş yapmış emlakçılar)
router.post('/', tokenDogrula, ilanEkle);

// TODO: İleride eklenecekler
// router.put('/:id',    tokenDogrula, ilanGuncelle);
// router.delete('/:id', tokenDogrula, rolKontrol('admin','patron'), ilanSil);

module.exports = router;

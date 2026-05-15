'use strict';

const express = require('express');
const router  = express.Router();
const {
  bildirimleriGetir,
  okunmamisBildirimSayisi,
  bildirimOku,
  hepsiniOku,
} = require('../controllers/bildirimController');
const { tokenDogrula } = require('../middleware/authMiddleware');

router.use(tokenDogrula);

router.get('/',              bildirimleriGetir);
router.get('/okunmamis',     okunmamisBildirimSayisi);
router.patch('/hepsini-oku', hepsiniOku);
router.patch('/:id/oku',     bildirimOku);

module.exports = router;

'use strict';

const express = require('express');
const router  = express.Router();
const {
  konusmalariGetir,
  mesajlariGetir,
  mesajGonder,
  okunmamisSayisi,
} = require('../controllers/mesajController');
const { tokenDogrula } = require('../middleware/authMiddleware');

router.use(tokenDogrula);

router.get('/',                   konusmalariGetir);
router.get('/okunmamis',          okunmamisSayisi);
router.get('/:konusmaId',         mesajlariGetir);
router.post('/',                  mesajGonder);

module.exports = router;

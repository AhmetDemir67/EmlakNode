'use strict';

const express = require('express');
const router  = express.Router();
const { dukkanGetir, dukkanGuncelle, danismanlarGetir, istatistiklerGetir, danismanEkle, danismanCikar } = require('../controllers/dukkanController');
const { tokenDogrula } = require('../middleware/authMiddleware');

router.get   ('/:id',                          tokenDogrula, dukkanGetir);
router.put   ('/:id',                          tokenDogrula, dukkanGuncelle);
router.get   ('/:id/danismanlar',              tokenDogrula, danismanlarGetir);
router.post  ('/:id/danismanlar',              tokenDogrula, danismanEkle);
router.delete('/:id/danismanlar/:kulId',       tokenDogrula, danismanCikar);
router.get   ('/:id/istatistikler',            tokenDogrula, istatistiklerGetir);

module.exports = router;

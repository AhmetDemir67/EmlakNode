'use strict';

const express = require('express');
const router  = express.Router();
const { dukkanGetir, dukkanGuncelle, danismanlarGetir, istatistiklerGetir } = require('../controllers/dukkanController');
const { tokenDogrula } = require('../middleware/authMiddleware');

router.get ('/:id',               tokenDogrula, dukkanGetir);
router.put ('/:id',               tokenDogrula, dukkanGuncelle);
router.get ('/:id/danismanlar',   tokenDogrula, danismanlarGetir);
router.get ('/:id/istatistikler', tokenDogrula, istatistiklerGetir);

module.exports = router;

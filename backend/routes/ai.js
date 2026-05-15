'use strict';

const express = require('express');
const router  = express.Router();
const { tokenDogrula } = require('../middleware/authMiddleware');
const { aciklamaUret, mulkDegerle, chatbot, ulasimAnalizi } = require('../controllers/aiController');

router.post('/aciklama-uret', tokenDogrula, aciklamaUret);
router.post('/degerleme',     mulkDegerle);
router.post('/chatbot',       chatbot);
router.post('/ulasim',        ulasimAnalizi);

module.exports = router;

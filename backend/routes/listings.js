'use strict';

const express = require('express');
const router  = express.Router();
const {
    ilanEkle,
    ilanlariGetir,
    ilanGetir,
    ilanGuncelle,
    ilanSil,
} = require('../controllers/listingController');
const { tokenDogrula } = require('../middleware/authMiddleware');

// ─── Herkese Açık ────────────────────────────────────────────────
// GET  /api/ilanlar            → Tüm ilanları listele (filtre + sayfalama)
router.get('/', ilanlariGetir);

// GET  /api/ilanlar/:id        → Tek ilan detayı
router.get('/:id', ilanGetir);

// ─── Korumalı (Token Zorunlu) ────────────────────────────────────
// POST   /api/ilanlar          → Yeni ilan ekle (emlakçılar)
router.post('/', tokenDogrula, ilanEkle);

// PUT    /api/ilanlar/:id      → İlan güncelle (sadece sahibi veya admin)
router.put('/:id', tokenDogrula, ilanGuncelle);

// DELETE /api/ilanlar/:id      → İlan sil (sadece sahibi veya admin)
router.delete('/:id', tokenDogrula, ilanSil);

module.exports = router;

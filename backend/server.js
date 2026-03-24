'use strict';

require('dotenv').config();
const express = require('express');
const { baglantiTestEt } = require('./config/db');

// Rotalar
const authRoutes = require('./routes/auth');

const app = express();

// ----------------------------------------------------------------
// Global Middleware
// ----------------------------------------------------------------
app.use(express.json());             // JSON body parse
app.use(express.urlencoded({ extended: true })); // Form data parse

// ----------------------------------------------------------------
// API Rotaları
// ----------------------------------------------------------------
app.use('/api/auth', authRoutes);  // /api/auth/kayit, /api/auth/giris ...

// TODO: İleride eklenecekler
// app.use('/api/ilanlar',    ilanRoutes);
// app.use('/api/dukkanlar',  dukkanRoutes);
// app.use('/api/degerleme',  degerlemeRoutes);

// ----------------------------------------------------------------
// Global Hata Yakalayıcı (Express'in en altında olmalı)
// ----------------------------------------------------------------
app.use((err, req, res, next) => {
    console.error('Sunucu hatası:', err.message);
    res.status(500).json({
        basarili: false,
        mesaj: 'Sunucu tarafında beklenmedik bir hata oluştu.',
    });
});

// ----------------------------------------------------------------
// Sunucuyu Başlat
// ----------------------------------------------------------------
const baslat = async () => {
    console.log('Emlak Platform API baslatiliyor...');

    await baglantiTestEt(); // Veritabanı bağlantısını doğrula

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Sunucu http://localhost:${PORT} adresinde calisiyor.`);
        console.log(`Kayit endpoint: POST http://localhost:${PORT}/api/auth/kayit`);
    });
};

baslat();

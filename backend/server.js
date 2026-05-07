'use strict';

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const multer  = require('multer');
const fs      = require('fs');
const { baglantiTestEt } = require('./config/db');

// Rotalar
const authRoutes      = require('./routes/auth');
const ilanRoutes      = require('./routes/listings');
const favorilerRoutes = require('./routes/favoriler');

const app = express();

// ----------------------------------------------------------------
// Upload Klasörü
// ----------------------------------------------------------------
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Multer: disk storage, her dosyaya benzersiz ad
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `img_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024, files: 50 }, // 15MB/dosya, max 50 dosya
  fileFilter: (req, file, cb) => {
    const izinli = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];
    cb(null, izinli.includes(file.mimetype));
  },
});

// ----------------------------------------------------------------
// Global Middleware
// ----------------------------------------------------------------
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Yüklenen resimleri statik olarak sun
app.use('/uploads', express.static(uploadsDir));

// ----------------------------------------------------------------
// Upload Endpoint
// POST /api/upload  →  { basarili: true, urls: [...] }
// ----------------------------------------------------------------
app.post('/api/upload', upload.array('fotograflar', 50), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ basarili: false, mesaj: 'Hiç dosya alınamadı.' });
  }
  const host = `${req.protocol}://${req.get('host')}`;
  const urls = req.files.map(f => `${host}/uploads/${f.filename}`);
  return res.json({ basarili: true, urls });
});

// ----------------------------------------------------------------
// API Rotaları
// ----------------------------------------------------------------
app.use('/api/auth',      authRoutes);
app.use('/api/ilanlar',  ilanRoutes);
app.use('/api/favoriler', favorilerRoutes);

// ----------------------------------------------------------------
// Global Hata Yakalayıcı
// ----------------------------------------------------------------
app.use((err, req, res, next) => {
  console.error('Sunucu hatası:', err.message);
  res.status(500).json({ basarili: false, mesaj: 'Sunucu tarafında beklenmedik bir hata oluştu.' });
});

// ----------------------------------------------------------------
// Sunucuyu Başlat
// ----------------------------------------------------------------
const baslat = async () => {
  console.log('Emlak Platform API baslatiliyor...');
  await baglantiTestEt();

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} adresinde calisiyor.`);
    console.log(`Upload  → POST http://localhost:${PORT}/api/upload`);
    console.log(`Ilanlar → GET  http://localhost:${PORT}/api/ilanlar`);
    console.log(`Ilanlar → POST http://localhost:${PORT}/api/ilanlar`);
  });
};

baslat();

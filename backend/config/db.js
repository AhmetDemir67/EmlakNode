'use strict';

const path = require('path');
// .env dosyası projenin kök dizininde (backend'in 2 üst klasörü)
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { Pool } = require('pg');

// ----------------------------------------------------------------
// Bağlantı Havuzu (Connection Pool)
// Pool; aynı anda gelen birden fazla isteği kuyrukta yönetir,
// her istek için yeni bağlantı açmak yerine mevcut bağlantıları yeniden kullanır.
// ----------------------------------------------------------------
const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: String(process.env.DB_PASSWORD), // Kesin string'e çevir

  // Havuz ayarları
  max: 10,                          // Maksimum eş zamanlı bağlantı sayısı
  idleTimeoutMillis: 30000,         // Boştaki bağlantı 30sn sonra kapatılır
  connectionTimeoutMillis: 2000,    // 2sn içinde bağlanamazsa hata fırlatır
});

// ----------------------------------------------------------------
// Bağlantı hatalarını merkezi olarak yakala (pool seviyesinde)
// ----------------------------------------------------------------
pool.on('error', (err) => {
  console.error('❌ PostgreSQL bağlantı havuzunda beklenmedik hata:', err.message);
  process.exit(-1);
});

// ----------------------------------------------------------------
// Bağlantı Test Fonksiyonu
// Sunucu başlarken çağrılabilir; bağlantının sağlıklı olduğunu doğrular.
// ----------------------------------------------------------------
const baglantiTestEt = async () => {
  let client;
  try {
    client = await pool.connect();
    const sonuc = await client.query('SELECT NOW() AS simdi');
    console.log('✅ PostgreSQL bağlantısı başarılı!');
    console.log(`   Veritabanı: ${process.env.DB_NAME}`);
    console.log(`   Sunucu saati: ${sonuc.rows[0].simdi}`);
  } catch (err) {
    console.error('❌ PostgreSQL bağlantısı BAŞARISIZ!');
    console.error('   Hata:', err.message);
    console.error('   .env dosyasındaki bağlantı bilgilerini kontrol et.');
    process.exit(1);
  } finally {
    // Client'ı mutlaka havuza geri bırak
    if (client) client.release();
  }
};

// ----------------------------------------------------------------
// Yardımcı sorgu fonksiyonu
// Tüm modüllerde pool.query() yerine bu kullanılır.
// ----------------------------------------------------------------
const sorgu = (sql, params) => pool.query(sql, params);

module.exports = {
  pool,
  sorgu,
  baglantiTestEt,
};

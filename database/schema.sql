-- ============================================================
-- EMLAK PLATFORMU - PostgreSQL Veritabanı Şeması
-- Oluşturulma Tarihi: 2026-03-24
-- ============================================================


-- ============================================================
-- ENUM TİPLERİ
-- ============================================================

-- Kullanıcı rolleri
CREATE TYPE kullanici_rol AS ENUM (
    'admin',
    'patron',
    'danisman',
    'musteri'
);

-- Değerleme talebi durumları
CREATE TYPE degerleme_durum AS ENUM (
    'beklemede',
    'emlakciya_atandi',
    'tamamlandi'
);


-- ============================================================
-- 1. TABLO: dukkanlar (Emlak Ofisleri)
-- Bağımlılığı yok, önce oluşturulur.
-- ============================================================

CREATE TABLE dukkanlar (
    id                SERIAL PRIMARY KEY,
    dukkan_adi        VARCHAR(255) NOT NULL,
    sehir             VARCHAR(100) NOT NULL,
    ilce              VARCHAR(100) NOT NULL,
    yetki_belge_no    VARCHAR(100) NOT NULL UNIQUE,
    vergi_no          VARCHAR(20)  NOT NULL UNIQUE,
    olusturulma_tarihi TIMESTAMP   NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 2. TABLO: kullanicilar (Kullanıcılar / Users)
-- Emlakçı rolündeki kullanıcılar bir dükkana bağlıdır.
-- dukkanlar silinirse ilişkili kullanıcılar da silinir (CASCADE).
-- ============================================================

CREATE TABLE kullanicilar (
    id                 SERIAL PRIMARY KEY,
    ad_soyad           VARCHAR(255)   NOT NULL,
    eposta             VARCHAR(255)   NOT NULL UNIQUE,
    sifre              VARCHAR(255)   NOT NULL,          -- bcrypt / argon2 hash
    rol                kullanici_rol  NOT NULL DEFAULT 'musteri',
    tc_no              VARCHAR(11)    UNIQUE,
    dukkan_id          INTEGER        REFERENCES dukkanlar(id) ON DELETE CASCADE,
    olusturulma_tarihi TIMESTAMP      NOT NULL DEFAULT NOW()
);

-- tc_no sadece Türk vatandaşları için zorunlu olabileceğinden NULL bırakıldı.
-- dukkan_id: musteri rolündeki kullanıcılar için NULL olabilir.


-- ============================================================
-- 3. TABLO: ilanlar (Emlak İlanları / Property Listings)
-- Her ilan bir dükkana aittir.
-- dukkanlar silinirse ilişkili ilanlar da silinir (CASCADE).
-- ============================================================

CREATE TABLE ilanlar (
    id                 SERIAL PRIMARY KEY,
    baslik             VARCHAR(500)    NOT NULL,
    aciklama           TEXT,
    fiyat              NUMERIC(15, 2)  NOT NULL,
    metrekare          NUMERIC(8, 2)   NOT NULL,
    oda_sayisi         VARCHAR(20),                      -- Örn: '3+1', '2+1'
    bina_yasi          INTEGER,
    kat                INTEGER,
    isinma_tipi        VARCHAR(100),                     -- Örn: 'Doğalgaz', 'Kombi'
    enlem              DECIMAL(10, 8),                   -- Harita koordinatı (Latitude)
    boylam             DECIMAL(11, 8),                   -- Harita koordinatı (Longitude)
    ai_aciklama        TEXT,                             -- AI tarafından üretilen ilan metni
    dukkan_id          INTEGER         NOT NULL REFERENCES dukkanlar(id) ON DELETE CASCADE,
    olusturulma_tarihi TIMESTAMP       NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 4. TABLO: degerleme_talepleri (AI Değerleme Talepleri)
-- Müşteriler AI üzerinden fiyat tahmini talep eder.
-- Talep bir emlak ofisine atanabilir.
-- ============================================================

CREATE TABLE degerleme_talepleri (
    id                 SERIAL PRIMARY KEY,
    musteri_id         INTEGER         NOT NULL REFERENCES kullanicilar(id) ON DELETE CASCADE,
    hedef_sehir        VARCHAR(100)    NOT NULL,
    hedef_ilce         VARCHAR(100)    NOT NULL,
    mulk_ozellikleri   JSONB           NOT NULL,          -- Esnek mülk bilgileri (JSON)
    ai_tahmini_fiyat   NUMERIC(15, 2),                   -- AI tarafından hesaplanır, başta NULL olabilir
    durum              degerleme_durum NOT NULL DEFAULT 'beklemede',
    atanan_dukkan_id   INTEGER         REFERENCES dukkanlar(id) ON DELETE CASCADE,
    olusturulma_tarihi TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- atanan_dukkan_id: Henüz atanmamış talepler için NULL olabilir.


-- ============================================================
-- İNDEKSLER (Performans için önerilen)
-- ============================================================

CREATE INDEX idx_kullanicilar_dukkan_id       ON kullanicilar(dukkan_id);
CREATE INDEX idx_kullanicilar_rol             ON kullanicilar(rol);
CREATE INDEX idx_ilanlar_dukkan_id            ON ilanlar(dukkan_id);
CREATE INDEX idx_ilanlar_fiyat               ON ilanlar(fiyat);
CREATE INDEX idx_degerleme_musteri_id         ON degerleme_talepleri(musteri_id);
CREATE INDEX idx_degerleme_atanan_dukkan_id   ON degerleme_talepleri(atanan_dukkan_id);
CREATE INDEX idx_degerleme_durum             ON degerleme_talepleri(durum);
CREATE INDEX idx_degerleme_mulk_ozellikleri  ON degerleme_talepleri USING GIN(mulk_ozellikleri);

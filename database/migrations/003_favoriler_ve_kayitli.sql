-- Favoriler
CREATE TABLE IF NOT EXISTS favoriler (
  id                 SERIAL PRIMARY KEY,
  kullanici_id       INTEGER NOT NULL REFERENCES kullanicilar(id) ON DELETE CASCADE,
  ilan_id            INTEGER NOT NULL REFERENCES ilanlar(id) ON DELETE CASCADE,
  olusturulma_tarihi TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(kullanici_id, ilan_id)
);

-- Kayıtlı Aramalar
CREATE TABLE IF NOT EXISTS kayitli_aramalar (
  id                 SERIAL PRIMARY KEY,
  kullanici_id       INTEGER NOT NULL REFERENCES kullanicilar(id) ON DELETE CASCADE,
  baslik             VARCHAR(100) NOT NULL,
  filtreler          JSONB NOT NULL DEFAULT '{}',
  olusturulma_tarihi TIMESTAMPTZ DEFAULT NOW()
);

-- Kayıtlı Adresler
CREATE TABLE IF NOT EXISTS kayitli_adresler (
  id                 SERIAL PRIMARY KEY,
  kullanici_id       INTEGER NOT NULL REFERENCES kullanicilar(id) ON DELETE CASCADE,
  baslik             VARCHAR(100) NOT NULL,
  adres              TEXT,
  sehir              VARCHAR(100),
  ilce               VARCHAR(100),
  enlem              DECIMAL(10,8),
  boylam             DECIMAL(11,8),
  olusturulma_tarihi TIMESTAMPTZ DEFAULT NOW()
);

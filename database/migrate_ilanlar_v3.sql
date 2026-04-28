-- EmlakNode – ilanlar tablosu v3 migration
-- Çalıştır: psql -U postgres -d emlak_db -f database/migrate_ilanlar_v3.sql

-- İlan durumu: aktif | pasif | satildi | kiralandı
ALTER TABLE ilanlar ADD COLUMN IF NOT EXISTS durum VARCHAR(20) NOT NULL DEFAULT 'aktif';

-- Geçerli değer kısıtlaması
ALTER TABLE ilanlar DROP CONSTRAINT IF EXISTS ck_ilan_durum;
ALTER TABLE ilanlar ADD CONSTRAINT ck_ilan_durum
  CHECK (durum IN ('aktif', 'pasif', 'satildi', 'kiralandı'));

-- Hızlı sorgulama için index
CREATE INDEX IF NOT EXISTS idx_ilanlar_durum ON ilanlar(durum);

-- Var olan kayıtları varsayılan değere al
UPDATE ilanlar SET durum = 'aktif' WHERE durum IS NULL;

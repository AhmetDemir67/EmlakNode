-- EmlakNode – ilanlar tablosu v2 migration
-- Çalıştır: psql -U postgres -d emlak_db -f database/migrate_ilanlar_v2.sql

ALTER TABLE ilanlar ADD COLUMN IF NOT EXISTS tip              VARCHAR(20)  DEFAULT 'Satılık';
ALTER TABLE ilanlar ADD COLUMN IF NOT EXISTS emlak_turu       VARCHAR(50)  DEFAULT 'Daire';
ALTER TABLE ilanlar ADD COLUMN IF NOT EXISTS toplam_kat       INTEGER;
ALTER TABLE ilanlar ADD COLUMN IF NOT EXISTS banyo_sayisi     INTEGER;
ALTER TABLE ilanlar ADD COLUMN IF NOT EXISTS balkon           BOOLEAN DEFAULT FALSE;
ALTER TABLE ilanlar ADD COLUMN IF NOT EXISTS asansor          BOOLEAN DEFAULT FALSE;
ALTER TABLE ilanlar ADD COLUMN IF NOT EXISTS otopark          BOOLEAN DEFAULT FALSE;
ALTER TABLE ilanlar ADD COLUMN IF NOT EXISTS esyali           BOOLEAN DEFAULT FALSE;
ALTER TABLE ilanlar ADD COLUMN IF NOT EXISTS site_icerisinde  BOOLEAN DEFAULT FALSE;
ALTER TABLE ilanlar ADD COLUMN IF NOT EXISTS sehir            VARCHAR(100);
ALTER TABLE ilanlar ADD COLUMN IF NOT EXISTS ilce             VARCHAR(100);
ALTER TABLE ilanlar ADD COLUMN IF NOT EXISTS mahalle          VARCHAR(100);
ALTER TABLE ilanlar ADD COLUMN IF NOT EXISTS gorsel           TEXT;

UPDATE ilanlar SET tip = 'Satılık' WHERE tip IS NULL;
UPDATE ilanlar SET emlak_turu = 'Daire' WHERE emlak_turu IS NULL;

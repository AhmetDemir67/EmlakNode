-- EmlakNode – ilanlar tablosu v4 migration
-- Bireysel kullanıcıların (müşterilerin) da ilan vermesine izin ver
-- Çalıştır: psql -U postgres -d emlak_db -f database/migrate_ilanlar_v4.sql

-- dukkan_id kısıtlamasını kaldır, kullanici_id ekle
ALTER TABLE ilanlar ALTER COLUMN dukkan_id DROP NOT NULL;
ALTER TABLE ilanlar ADD COLUMN IF NOT EXISTS kullanici_id INTEGER REFERENCES kullanicilar(id) ON DELETE SET NULL;

-- Mevcut kayıtlarda kullanici_id'yi dukkan'ın patron'undan doldur (en iyi effort)
UPDATE ilanlar i
SET kullanici_id = (
    SELECT k.id FROM kullanicilar k WHERE k.dukkan_id = i.dukkan_id AND k.rol = 'patron' LIMIT 1
)
WHERE i.kullanici_id IS NULL AND i.dukkan_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ilanlar_kullanici ON ilanlar(kullanici_id);

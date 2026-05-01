-- Migration v5: krediye_uygunluk ve takas alanları eklendi
ALTER TABLE ilanlar ADD COLUMN IF NOT EXISTS krediye_uygunluk BOOLEAN DEFAULT NULL;
ALTER TABLE ilanlar ADD COLUMN IF NOT EXISTS takas             BOOLEAN DEFAULT NULL;

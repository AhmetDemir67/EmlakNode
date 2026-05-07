-- onceki_fiyat kolonunu ilanlar tablosuna ekle
-- Fiyat düştüğünde eski fiyat buraya kaydedilir, fiyat artınca NULL yapılır

ALTER TABLE ilanlar
  ADD COLUMN IF NOT EXISTS onceki_fiyat NUMERIC(15, 2);

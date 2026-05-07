-- Kullanicilar tablosuna profil alanları ekleniyor
ALTER TABLE kullanicilar
  ADD COLUMN IF NOT EXISTS telefon      VARCHAR(20),
  ADD COLUMN IF NOT EXISTS dogum_tarihi DATE,
  ADD COLUMN IF NOT EXISTS il           VARCHAR(100),
  ADD COLUMN IF NOT EXISTS ilce         VARCHAR(100);

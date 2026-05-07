-- Migration: İlanlar tablosuna fotograflar kolonu ekle
-- Tarih: 2026-05-05
-- Açıklama: Birden fazla fotoğraf URL'ini JSON dizi olarak saklar.
--           Eski ilanlar için NULL gelir; uygulama gorsel alanına fallback yapar.

ALTER TABLE ilanlar
    ADD COLUMN IF NOT EXISTS fotograflar JSONB DEFAULT NULL;

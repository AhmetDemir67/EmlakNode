-- Konuşmalar tablosu
CREATE TABLE IF NOT EXISTS konusmalar (
  id             SERIAL PRIMARY KEY,
  ilan_id        INTEGER REFERENCES ilanlar(id) ON DELETE SET NULL,
  gonderen_id    INTEGER NOT NULL REFERENCES kullanicilar(id) ON DELETE CASCADE,
  alici_id       INTEGER NOT NULL REFERENCES kullanicilar(id) ON DELETE CASCADE,
  olusturulma    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (ilan_id, gonderen_id, alici_id)
);

-- Mesajlar tablosu
CREATE TABLE IF NOT EXISTS mesajlar (
  id             SERIAL PRIMARY KEY,
  konusma_id     INTEGER NOT NULL REFERENCES konusmalar(id) ON DELETE CASCADE,
  gonderen_id    INTEGER NOT NULL REFERENCES kullanicilar(id) ON DELETE CASCADE,
  metin          TEXT NOT NULL,
  okundu         BOOLEAN NOT NULL DEFAULT FALSE,
  olusturulma    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mesajlar_konusma ON mesajlar(konusma_id, olusturulma);

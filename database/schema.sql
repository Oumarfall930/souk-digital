-- ═══════════════════════════════════════════════════════════
-- SOUK DIGITAL — Schéma base de données Supabase (PostgreSQL)
-- Copiez tout ce fichier dans Supabase → SQL Editor → Run
-- ═══════════════════════════════════════════════════════════

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── TABLE : users ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT CHECK(role IN ('admin', 'seller')) DEFAULT 'seller',
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ── TABLE : shops ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shops (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  emoji       TEXT DEFAULT '🏪',
  whatsapp    TEXT NOT NULL,
  category    TEXT DEFAULT 'autre',
  payments    TEXT[] DEFAULT ARRAY[]::TEXT[],
  active      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ── TABLE : products ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id     UUID REFERENCES shops(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  emoji       TEXT DEFAULT '📦',
  -- colors: [{"name": "Rouge", "hex": "#FF0000"}, ...]
  colors      JSONB DEFAULT '[]'::JSONB,
  -- sizes:  [{"size": "M", "price": 299}, ...]
  sizes       JSONB DEFAULT '[]'::JSONB,
  active      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ── TABLE : sales ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sales (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id      UUID REFERENCES shops(id) ON DELETE SET NULL,
  product_id   UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  color        TEXT,
  size         TEXT,
  price        NUMERIC(10,2) NOT NULL CHECK(price > 0),
  sold_at      TIMESTAMPTZ DEFAULT now()
);

-- ── INDEX pour performances ────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_shops_user_id    ON shops(user_id);
CREATE INDEX IF NOT EXISTS idx_shops_active      ON shops(active);
CREATE INDEX IF NOT EXISTS idx_products_shop_id  ON products(shop_id);
CREATE INDEX IF NOT EXISTS idx_products_active   ON products(active);
CREATE INDEX IF NOT EXISTS idx_sales_shop_id     ON sales(shop_id);
CREATE INDEX IF NOT EXISTS idx_sales_sold_at     ON sales(sold_at DESC);

-- ── Row Level Security (désactivé pour accès via service key) ──
-- Le backend utilise la SERVICE KEY qui bypass RLS.
-- Si vous voulez activer RLS, décommentez les lignes ci-dessous.
-- ALTER TABLE users    ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE shops    ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sales    ENABLE ROW LEVEL SECURITY;

-- ── Données de test (OPTIONNEL — supprimez si vous voulez commencer vide) ──
-- L'admin sera créé automatiquement au premier démarrage du backend.
-- Vous pouvez ajouter des boutiques de test ici si vous le souhaitez.

-- ── Vérification ──────────────────────────────────────────
-- Après exécution, vérifiez que les tables sont créées :
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

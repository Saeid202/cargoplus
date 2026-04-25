-- ============================================
-- Migration 019: Checkout — variants & shipping_cost
-- Idempotent: safe to run multiple times
-- Requirements: 9.1, 9.2, 9.3
-- ============================================

-- cart_items: add variant columns
ALTER TABLE cart_items
  ADD COLUMN IF NOT EXISTS variant_code TEXT DEFAULT NULL;

ALTER TABLE cart_items
  ADD COLUMN IF NOT EXISTS variant_image_url TEXT DEFAULT NULL;

-- order_items: add variant columns
ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS variant_code TEXT DEFAULT NULL;

ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS variant_image_url TEXT DEFAULT NULL;

-- orders: add shipping_cost column
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0;

-- Drop old unique constraint (user_id, product_id) if it exists
ALTER TABLE cart_items
  DROP CONSTRAINT IF EXISTS cart_items_user_id_product_id_key;

-- Add new unique constraint (user_id, product_id, variant_code)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'cart_items_user_product_variant_key'
  ) THEN
    ALTER TABLE cart_items
      ADD CONSTRAINT cart_items_user_product_variant_key
      UNIQUE (user_id, product_id, variant_code);
  END IF;
END $$;

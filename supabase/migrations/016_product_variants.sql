-- Migration: Add variant support to product_images
-- Each image row can now represent a product variant with its own code and optional price

ALTER TABLE product_images
  ADD COLUMN IF NOT EXISTS variant_code   text    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS variant_price  numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_master      boolean DEFAULT false;

-- Index for fast variant lookups per product
CREATE INDEX IF NOT EXISTS idx_product_images_product_variant
  ON product_images (product_id, is_master);

COMMENT ON COLUMN product_images.variant_code  IS 'SKU / variant code shown to customers (e.g. A801). NULL for non-variant images.';
COMMENT ON COLUMN product_images.variant_price IS 'Optional price override for this variant. NULL means inherit master product price.';
COMMENT ON COLUMN product_images.is_master     IS 'True for the primary/master image of the product.';

-- Sample images per product line
CREATE TABLE IF NOT EXISTS consolidation_item_images (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID        NOT NULL REFERENCES consolidation_orders(id) ON DELETE CASCADE,
  item_index   INTEGER     NOT NULL,
  file_name    TEXT        NOT NULL,
  storage_path TEXT        NOT NULL,
  url          TEXT        NOT NULL,
  uploaded_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consolidation_images_order ON consolidation_item_images(order_id);

ALTER TABLE consolidation_item_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own item images"
  ON consolidation_item_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM consolidation_orders
      WHERE id = order_id AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM consolidation_orders
      WHERE id = order_id AND user_id = auth.uid()
    )
  );

-- Storage bucket for consolidation sample images
INSERT INTO storage.buckets (id, name, public)
VALUES ('consolidation-images', 'consolidation-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users upload own consolidation images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'consolidation-images'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

CREATE POLICY "Public read consolidation images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'consolidation-images');

CREATE POLICY "Users delete own consolidation images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'consolidation-images'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

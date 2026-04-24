-- Fix: product_images had RLS enabled but no policies, blocking all reads

CREATE POLICY "Public can view product images"
  ON product_images FOR SELECT
  USING (true);

CREATE POLICY "Sellers can insert product images"
  ON product_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products
      WHERE id = product_id AND seller_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can delete product images"
  ON product_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE id = product_id AND seller_id = auth.uid()
    )
  );

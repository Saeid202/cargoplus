-- ─── CMS Images bucket (for slider images uploaded via admin panel) ───────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('cms-images', 'cms-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read cms images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'cms-images');

CREATE POLICY "Admin upload cms images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'cms-images');

CREATE POLICY "Admin delete cms images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'cms-images');

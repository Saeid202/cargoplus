-- ─── nav_items ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS nav_items (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  label           TEXT        NOT NULL,
  href            TEXT        NOT NULL,
  position        INTEGER     NOT NULL DEFAULT 0,
  is_active       BOOLEAN     NOT NULL DEFAULT true,
  open_in_new_tab BOOLEAN     NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nav_items_position ON nav_items(position);
CREATE INDEX IF NOT EXISTS idx_nav_items_active   ON nav_items(is_active);

-- ─── page_contents ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS page_contents (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT        UNIQUE NOT NULL,
  title        TEXT        NOT NULL,
  content      TEXT        NOT NULL DEFAULT '',
  parent_id    UUID        REFERENCES page_contents(id) ON DELETE SET NULL,
  show_in_nav  BOOLEAN     NOT NULL DEFAULT false,
  nav_label    TEXT,
  nav_position INTEGER,
  is_protected BOOLEAN     NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT no_self_parent CHECK (parent_id IS NULL OR parent_id <> id)
);

CREATE INDEX IF NOT EXISTS idx_page_contents_slug        ON page_contents(slug);
CREATE INDEX IF NOT EXISTS idx_page_contents_parent      ON page_contents(parent_id);
CREATE INDEX IF NOT EXISTS idx_page_contents_show_in_nav ON page_contents(show_in_nav);

-- ─── updated_at trigger ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER nav_items_updated_at
  BEFORE UPDATE ON nav_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER page_contents_updated_at
  BEFORE UPDATE ON page_contents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE nav_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_contents ENABLE ROW LEVEL SECURITY;

-- Public can read active nav_items
CREATE POLICY "Public read active nav items"
  ON nav_items FOR SELECT
  USING (is_active = true);

-- Public can read all page_contents (needed for public pages + nav)
CREATE POLICY "Public read page contents"
  ON page_contents FOR SELECT
  USING (true);

-- Admin full access to nav_items
CREATE POLICY "Admin full access nav items"
  ON nav_items FOR ALL
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Admin full access to page_contents
CREATE POLICY "Admin full access page contents"
  ON page_contents FOR ALL
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- ─── Seed protected pages ─────────────────────────────────────────────────────
INSERT INTO page_contents (slug, title, content, is_protected, show_in_nav, nav_position) VALUES
  ('about',    'About Us',         '<h1>About Us</h1><p>About Shanghai Cargo Plus.</p>',          true, true, 1),
  ('contact',  'Contact',          '<h1>Contact Us</h1><p>Get in touch with our team.</p>',       true, true, 2),
  ('privacy',  'Privacy Policy',   '<h1>Privacy Policy</h1><p>Your privacy matters to us.</p>',  true, false, null),
  ('shipping', 'Shipping Policy',  '<h1>Shipping Policy</h1><p>Our shipping terms.</p>',          true, false, null),
  ('terms',    'Terms of Service', '<h1>Terms of Service</h1><p>Terms and conditions.</p>',       true, false, null)
ON CONFLICT (slug) DO NOTHING;

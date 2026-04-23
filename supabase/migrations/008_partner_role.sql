-- ─── Partners table ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS partners (
  id           UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT        NOT NULL,
  contact_name TEXT        NOT NULL,
  email        TEXT        NOT NULL,
  phone        TEXT,
  country      TEXT        NOT NULL DEFAULT 'China',
  status       TEXT        NOT NULL DEFAULT 'active'
                           CHECK (status IN ('active', 'suspended')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Engineering quotes ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS engineering_quotes (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id     UUID        NOT NULL REFERENCES engineering_projects(id) ON DELETE CASCADE,
  partner_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  price_cad      NUMERIC     NOT NULL,
  timeline_weeks INTEGER     NOT NULL,
  validity_days  INTEGER     NOT NULL,
  notes          TEXT,
  status         TEXT        NOT NULL DEFAULT 'submitted',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, partner_id)
);

-- ─── Quote files ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS engineering_quote_files (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id     UUID        NOT NULL REFERENCES engineering_quotes(id) ON DELETE CASCADE,
  file_name    TEXT        NOT NULL,
  storage_path TEXT        NOT NULL,
  uploaded_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_partners_status          ON partners(status);
CREATE INDEX IF NOT EXISTS idx_eng_quotes_project       ON engineering_quotes(project_id);
CREATE INDEX IF NOT EXISTS idx_eng_quotes_partner       ON engineering_quotes(partner_id);
CREATE INDEX IF NOT EXISTS idx_eng_quote_files_quote    ON engineering_quote_files(quote_id);

-- ─── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE partners                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_quotes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_quote_files  ENABLE ROW LEVEL SECURITY;

-- partners: each partner can read/update their own row
CREATE POLICY "Partners read own profile"
  ON partners FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Partners update own profile"
  ON partners FOR UPDATE
  USING (auth.uid() = id);

-- engineering_projects: partners can read ALL projects
CREATE POLICY "Partners read all projects"
  ON engineering_projects FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'partner'
  );

-- engineering_project_drawings: partners can read ALL drawings
CREATE POLICY "Partners read all drawings"
  ON engineering_project_drawings FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'partner'
  );

-- engineering_project_messages: partners can read ALL messages
CREATE POLICY "Partners read all messages"
  ON engineering_project_messages FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'partner'
  );

-- engineering_project_messages: partners can insert with sender_role='partner'
CREATE POLICY "Partners insert partner messages"
  ON engineering_project_messages FOR INSERT
  WITH CHECK (
    sender_role = 'partner'
    AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'partner'
  );

-- engineering_quotes: partners manage their own quotes
CREATE POLICY "Partners insert own quotes"
  ON engineering_quotes FOR INSERT
  WITH CHECK (partner_id = auth.uid());

CREATE POLICY "Partners update own quotes"
  ON engineering_quotes FOR UPDATE
  USING (partner_id = auth.uid());

CREATE POLICY "Partners read own quotes"
  ON engineering_quotes FOR SELECT
  USING (partner_id = auth.uid());

-- engineering_quotes: customers can read quotes on their own projects
CREATE POLICY "Customers read quotes on own projects"
  ON engineering_quotes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM engineering_projects
      WHERE id = project_id AND user_id = auth.uid()
    )
  );

-- engineering_quote_files: partners manage files for their own quotes
CREATE POLICY "Partners insert own quote files"
  ON engineering_quote_files FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM engineering_quotes
      WHERE id = quote_id AND partner_id = auth.uid()
    )
  );

CREATE POLICY "Partners read own quote files"
  ON engineering_quote_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM engineering_quotes
      WHERE id = quote_id AND partner_id = auth.uid()
    )
  );

-- engineering_quote_files: customers can read files for quotes on their projects
CREATE POLICY "Customers read quote files on own projects"
  ON engineering_quote_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM engineering_quotes q
      JOIN engineering_projects p ON p.id = q.project_id
      WHERE q.id = quote_id AND p.user_id = auth.uid()
    )
  );

-- ─── Storage: partner uploads under partner/ prefix ───────────────────────────
CREATE POLICY "Partners upload quote files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'engineering-drawings'
    AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'partner'
    AND (string_to_array(name, '/'))[1] = 'partner'
  );

CREATE POLICY "Partners read own uploaded files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'engineering-drawings'
    AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'partner'
    AND (string_to_array(name, '/'))[1] = 'partner'
  );

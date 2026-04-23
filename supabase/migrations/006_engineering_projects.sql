-- Engineering Projects Table
CREATE TABLE IF NOT EXISTS engineering_projects (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  project_name              TEXT NOT NULL,
  project_location_city     TEXT NOT NULL,
  project_location_province TEXT NOT NULL,
  project_type              TEXT NOT NULL CHECK (project_type IN ('residential', 'commercial', 'industrial')),
  total_area                NUMERIC NOT NULL,
  number_of_floors          INTEGER NOT NULL,
  building_length           NUMERIC NOT NULL,
  building_width            NUMERIC NOT NULL,
  building_height           NUMERIC,
  structure_type            TEXT NOT NULL DEFAULT 'light_steel_structure',
  no_drawings_flag          BOOLEAN NOT NULL DEFAULT false,
  delivery_location         TEXT NOT NULL,
  budget_range              TEXT NOT NULL CHECK (budget_range IN ('under_100k', '100k_300k', '300k_plus')),
  full_name                 TEXT NOT NULL,
  company_name              TEXT NOT NULL,
  email                     TEXT NOT NULL,
  phone                     TEXT NOT NULL,
  project_description       TEXT,
  status                    TEXT NOT NULL DEFAULT 'pending',
  created_at                TIMESTAMPTZ DEFAULT NOW()
);

-- Engineering Project Drawings Table
CREATE TABLE IF NOT EXISTS engineering_project_drawings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID NOT NULL REFERENCES engineering_projects(id) ON DELETE CASCADE,
  file_name    TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_engineering_projects_user    ON engineering_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_engineering_projects_status  ON engineering_projects(status);
CREATE INDEX IF NOT EXISTS idx_engineering_drawings_project ON engineering_project_drawings(project_id);

-- Enable RLS
ALTER TABLE engineering_projects         ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_project_drawings ENABLE ROW LEVEL SECURITY;

-- RLS: users manage their own projects
CREATE POLICY "Users can insert own projects"
  ON engineering_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own projects"
  ON engineering_projects FOR SELECT
  USING (auth.uid() = user_id);

-- RLS: drawings follow project ownership
CREATE POLICY "Users can insert own drawings"
  ON engineering_project_drawings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM engineering_projects
      WHERE id = project_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own drawings"
  ON engineering_project_drawings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM engineering_projects
      WHERE id = project_id AND user_id = auth.uid()
    )
  );

-- Storage bucket for engineering drawings
INSERT INTO storage.buckets (id, name, public)
VALUES ('engineering-drawings', 'engineering-drawings', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: users can upload under their own user_id prefix
CREATE POLICY "Users can upload own drawings"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'engineering-drawings'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

CREATE POLICY "Users can read own drawings"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'engineering-drawings'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

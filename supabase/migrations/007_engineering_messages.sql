-- Messages thread per project
CREATE TABLE IF NOT EXISTS engineering_project_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES engineering_projects(id) ON DELETE CASCADE,
  sender_id   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('customer', 'partner')),
  message     TEXT,
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Files attached to messages
CREATE TABLE IF NOT EXISTS engineering_message_files (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id   UUID NOT NULL REFERENCES engineering_project_messages(id) ON DELETE CASCADE,
  file_name    TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_eng_messages_project  ON engineering_project_messages(project_id);
CREATE INDEX IF NOT EXISTS idx_eng_messages_unread   ON engineering_project_messages(project_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_eng_msg_files_message ON engineering_message_files(message_id);

-- RLS
ALTER TABLE engineering_project_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_message_files    ENABLE ROW LEVEL SECURITY;

-- Customers can read messages on their own projects
CREATE POLICY "Customers read own project messages"
  ON engineering_project_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM engineering_projects
      WHERE id = project_id AND user_id = auth.uid()
    )
  );

-- Customers can insert messages on their own projects
CREATE POLICY "Customers insert own project messages"
  ON engineering_project_messages FOR INSERT
  WITH CHECK (
    sender_role = 'customer'
    AND auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM engineering_projects
      WHERE id = project_id AND user_id = auth.uid()
    )
  );

-- Customers can mark messages as read on their own projects
CREATE POLICY "Customers update read status"
  ON engineering_project_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM engineering_projects
      WHERE id = project_id AND user_id = auth.uid()
    )
  );

-- Message files: readable if user owns the project
CREATE POLICY "Customers read own message files"
  ON engineering_message_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM engineering_project_messages m
      JOIN engineering_projects p ON p.id = m.project_id
      WHERE m.id = message_id AND p.user_id = auth.uid()
    )
  );

-- Storage policy for message attachments (reuses engineering-drawings bucket)
CREATE POLICY "Users upload message attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'engineering-drawings'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

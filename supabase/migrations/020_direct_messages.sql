-- ============================================================
-- Direct Messenger: conversations + messages
-- Participants: buyer (customer), agent, partner
-- Admin is excluded from this system
-- ============================================================

-- One conversation per unique pair of participants
CREATE TABLE IF NOT EXISTS conversations (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_a_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_a_role   TEXT        NOT NULL CHECK (participant_a_role IN ('customer', 'agent', 'partner')),
  participant_b_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_b_role   TEXT        NOT NULL CHECK (participant_b_role IN ('customer', 'agent', 'partner')),
  last_message         TEXT,
  last_message_at      TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Enforce one thread per pair regardless of who initiated
  UNIQUE (participant_a_id, participant_b_id),
  CHECK (participant_a_id <> participant_b_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_a ON conversations(participant_a_id);
CREATE INDEX IF NOT EXISTS idx_conversations_b ON conversations(participant_b_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last ON conversations(last_message_at DESC NULLS LAST);

-- Messages within a conversation
CREATE TABLE IF NOT EXISTS direct_messages (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID        NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_role     TEXT        NOT NULL CHECK (sender_role IN ('customer', 'agent', 'partner')),
  message         TEXT,
  is_read         BOOLEAN     NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dm_conversation ON direct_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_dm_sender       ON direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_dm_unread       ON direct_messages(conversation_id, is_read) WHERE is_read = false;

-- ── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE conversations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;

-- A user can see conversations they are part of
CREATE POLICY "Participants can view their conversations"
  ON conversations FOR SELECT
  USING (participant_a_id = auth.uid() OR participant_b_id = auth.uid());

-- A user can create a conversation where they are participant_a
CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (participant_a_id = auth.uid());

-- A user can update last_message on their own conversations
CREATE POLICY "Participants can update their conversations"
  ON conversations FOR UPDATE
  USING (participant_a_id = auth.uid() OR participant_b_id = auth.uid());

-- A user can read messages in conversations they belong to
CREATE POLICY "Participants can read messages"
  ON direct_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
        AND (c.participant_a_id = auth.uid() OR c.participant_b_id = auth.uid())
    )
  );

-- A user can send messages in conversations they belong to
CREATE POLICY "Participants can send messages"
  ON direct_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
        AND (c.participant_a_id = auth.uid() OR c.participant_b_id = auth.uid())
    )
  );

-- A user can mark messages as read in their conversations
CREATE POLICY "Participants can mark messages read"
  ON direct_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
        AND (c.participant_a_id = auth.uid() OR c.participant_b_id = auth.uid())
    )
  );

-- ── Enable Realtime ───────────────────────────────────────────────────────────
-- Run in Supabase dashboard: Realtime > Tables > enable direct_messages
-- Or via SQL:
ALTER PUBLICATION supabase_realtime ADD TABLE direct_messages;

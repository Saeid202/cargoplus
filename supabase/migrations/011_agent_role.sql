-- Add status and unread flag to consolidation_orders
ALTER TABLE consolidation_orders
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'quoted', 'completed')),
  ADD COLUMN IF NOT EXISTS has_unread_response BOOLEAN NOT NULL DEFAULT false;

-- Message thread per consolidation order
CREATE TABLE IF NOT EXISTS consolidation_order_messages (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID        NOT NULL REFERENCES consolidation_orders(id) ON DELETE CASCADE,
  sender_id   UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_role TEXT        NOT NULL CHECK (sender_role IN ('buyer', 'agent')),
  message     TEXT,
  is_read     BOOLEAN     NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Message file attachments
CREATE TABLE IF NOT EXISTS consolidation_message_files (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id   UUID        NOT NULL REFERENCES consolidation_order_messages(id) ON DELETE CASCADE,
  file_name    TEXT        NOT NULL,
  storage_path TEXT        NOT NULL,
  url          TEXT        NOT NULL,
  uploaded_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Formal agent response / quote per order
CREATE TABLE IF NOT EXISTS consolidation_order_responses (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id       UUID        NOT NULL REFERENCES consolidation_orders(id) ON DELETE CASCADE,
  agent_id       UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  supplier_name  TEXT,
  unit_price     NUMERIC,
  lead_time_days INTEGER,
  notes          TEXT,
  status_update  TEXT        NOT NULL DEFAULT 'in_progress'
                             CHECK (status_update IN ('pending','in_progress','quoted','completed')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (order_id)
);

-- Response file attachments
CREATE TABLE IF NOT EXISTS consolidation_response_files (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id  UUID        NOT NULL REFERENCES consolidation_order_responses(id) ON DELETE CASCADE,
  file_name    TEXT        NOT NULL,
  storage_path TEXT        NOT NULL,
  url          TEXT        NOT NULL,
  uploaded_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_consol_messages_order    ON consolidation_order_messages(order_id);
CREATE INDEX IF NOT EXISTS idx_consol_msg_files_msg     ON consolidation_message_files(message_id);
CREATE INDEX IF NOT EXISTS idx_consol_responses_order   ON consolidation_order_responses(order_id);
CREATE INDEX IF NOT EXISTS idx_consol_resp_files_resp   ON consolidation_response_files(response_id);

-- RLS
ALTER TABLE consolidation_order_messages   ENABLE ROW LEVEL SECURITY;
ALTER TABLE consolidation_message_files    ENABLE ROW LEVEL SECURITY;
ALTER TABLE consolidation_order_responses  ENABLE ROW LEVEL SECURITY;
ALTER TABLE consolidation_response_files   ENABLE ROW LEVEL SECURITY;

-- Buyers can read/insert messages on their own orders
CREATE POLICY "Buyers read own order messages"
  ON consolidation_order_messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM consolidation_orders WHERE id = order_id AND user_id = auth.uid()));

CREATE POLICY "Buyers insert own order messages"
  ON consolidation_order_messages FOR INSERT
  WITH CHECK (
    sender_role = 'buyer' AND sender_id = auth.uid()
    AND EXISTS (SELECT 1 FROM consolidation_orders WHERE id = order_id AND user_id = auth.uid())
  );

CREATE POLICY "Buyers update read status on own orders"
  ON consolidation_order_messages FOR UPDATE
  USING (EXISTS (SELECT 1 FROM consolidation_orders WHERE id = order_id AND user_id = auth.uid()));

-- Buyers can read message files on their own orders
CREATE POLICY "Buyers read own message files"
  ON consolidation_message_files FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM consolidation_order_messages m
    JOIN consolidation_orders o ON o.id = m.order_id
    WHERE m.id = message_id AND o.user_id = auth.uid()
  ));

-- Buyers can read responses on their own orders
CREATE POLICY "Buyers read own order responses"
  ON consolidation_order_responses FOR SELECT
  USING (EXISTS (SELECT 1 FROM consolidation_orders WHERE id = order_id AND user_id = auth.uid()));

-- Buyers can read response files on their own orders
CREATE POLICY "Buyers read own response files"
  ON consolidation_response_files FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM consolidation_order_responses r
    JOIN consolidation_orders o ON o.id = r.order_id
    WHERE r.id = response_id AND o.user_id = auth.uid()
  ));

-- Storage bucket for agent response files
INSERT INTO storage.buckets (id, name, public)
VALUES ('consolidation-responses', 'consolidation-responses', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read consolidation response files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'consolidation-responses');

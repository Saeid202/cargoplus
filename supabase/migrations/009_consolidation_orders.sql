-- Consolidation orders
CREATE TABLE IF NOT EXISTS consolidation_orders (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_name TEXT        NOT NULL,
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order line items
CREATE TABLE IF NOT EXISTS consolidation_order_items (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id       UUID        NOT NULL REFERENCES consolidation_orders(id) ON DELETE CASCADE,
  product_name   TEXT        NOT NULL,
  category       TEXT        NOT NULL,
  specification  TEXT,
  quantity       NUMERIC     NOT NULL,
  unit           TEXT        NOT NULL,
  target_price   NUMERIC,
  reference_link TEXT,
  priority       TEXT        NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  position       INTEGER     NOT NULL DEFAULT 0
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_consolidation_orders_user ON consolidation_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_consolidation_items_order ON consolidation_order_items(order_id);

-- RLS
ALTER TABLE consolidation_orders       ENABLE ROW LEVEL SECURITY;
ALTER TABLE consolidation_order_items  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own orders"
  ON consolidation_orders FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users manage own order items"
  ON consolidation_order_items FOR ALL
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

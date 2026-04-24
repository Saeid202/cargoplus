-- RLS policies for the sellers table
-- Previously RLS was enabled but no policies existed, blocking all reads/writes.

-- Sellers can read their own profile
CREATE POLICY "Sellers can view own profile"
  ON sellers FOR SELECT
  USING (auth.uid() = id);

-- Sellers can update their own profile
CREATE POLICY "Sellers can update own profile"
  ON sellers FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins and public can read seller profiles (needed for product pages showing seller info)
CREATE POLICY "Public can view seller profiles"
  ON sellers FOR SELECT
  USING (true);

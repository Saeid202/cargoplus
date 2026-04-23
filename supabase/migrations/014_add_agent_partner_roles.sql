-- Extend profiles.role CHECK constraint to include 'agent' and 'partner'
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('customer', 'seller', 'admin', 'agent', 'partner'));

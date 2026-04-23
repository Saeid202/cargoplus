-- Backfill profile rows for agent users whose profile insert previously failed
INSERT INTO profiles (id, email, full_name, phone, role, created_at, updated_at)
SELECT
  au.id,
  au.email,
  au.raw_user_meta_data->>'full_name',
  null,
  'agent',
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE au.raw_user_meta_data->>'role' = 'agent'
  AND p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Also fix any existing profiles that have wrong role
UPDATE profiles
SET role = 'agent'
FROM auth.users au
WHERE profiles.id = au.id
  AND au.raw_user_meta_data->>'role' = 'agent'
  AND profiles.role != 'agent';

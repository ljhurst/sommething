-- Migration 012: Ensure all authenticated users have a default space
-- This handles users who signed up but never added bottles

-- Insert default space for any authenticated users who don't have one yet
INSERT INTO spaces (owner_user_id, name, description, rows, columns, space_type)
SELECT 
  au.id as owner_user_id,
  'My Wine Fridge' as name,
  'Your personal wine fridge' as description,
  6 as rows,
  4 as columns,
  'fridge' as space_type
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM spaces s WHERE s.owner_user_id = au.id
);

-- Add corresponding space_members records for new spaces
INSERT INTO space_members (space_id, user_id, role)
SELECT 
  s.id as space_id,
  s.owner_user_id as user_id,
  'owner' as role
FROM spaces s
WHERE NOT EXISTS (
  SELECT 1 FROM space_members sm 
  WHERE sm.space_id = s.id AND sm.user_id = s.owner_user_id
);

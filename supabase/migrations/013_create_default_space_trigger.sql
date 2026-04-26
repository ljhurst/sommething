-- Migration 013: Create trigger to automatically create default space for new users
-- This ensures every new user gets a default space immediately upon signup

-- Create function to handle new user space creation
CREATE OR REPLACE FUNCTION create_default_space_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default space
  INSERT INTO public.spaces (owner_user_id, name, description, rows, columns, space_type)
  VALUES (
    NEW.id,
    'My Wine Fridge',
    'Your personal wine fridge',
    6,
    4,
    'fridge'
  );
  
  -- Insert space_member record
  INSERT INTO public.space_members (space_id, user_id, role)
  SELECT s.id, NEW.id, 'owner'
  FROM public.spaces s
  WHERE s.owner_user_id = NEW.id
  ORDER BY s.created_at DESC
  LIMIT 1;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_space_for_new_user();

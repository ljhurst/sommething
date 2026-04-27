-- Create a trigger to automatically add the space owner to space_members
CREATE OR REPLACE FUNCTION add_owner_to_space_members()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.space_members (space_id, user_id, role)
  VALUES (NEW.id, NEW.owner_user_id, 'owner')
  ON CONFLICT (space_id, user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that fires after space creation
CREATE TRIGGER add_owner_to_members_trigger
  AFTER INSERT ON public.spaces
  FOR EACH ROW
  EXECUTE FUNCTION add_owner_to_space_members();

-- Backfill existing spaces: add owners to space_members
INSERT INTO public.space_members (space_id, user_id, role, joined_at)
SELECT 
  s.id,
  s.owner_user_id,
  'owner',
  s.created_at
FROM public.spaces s
WHERE NOT EXISTS (
  SELECT 1 FROM public.space_members sm
  WHERE sm.space_id = s.id AND sm.user_id = s.owner_user_id
);

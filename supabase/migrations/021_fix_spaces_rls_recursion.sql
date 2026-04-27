-- Migration 021: Fix infinite recursion in spaces RLS policy
-- 
-- The issue: spaces policy checks space_members, and space_members policy checks spaces,
-- creating infinite recursion.
--
-- Solution: Use a SECURITY DEFINER function to check membership without triggering RLS

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view spaces they own or are members of" ON public.spaces;

-- Create a helper function to check if user is a member (bypasses RLS)
CREATE OR REPLACE FUNCTION is_space_member(space_id UUID, user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.space_members
    WHERE space_members.space_id = $1
    AND space_members.user_id = $2
  );
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION is_space_member(UUID, UUID) TO authenticated;

-- Create new policy using the helper function (no recursion)
CREATE POLICY "Users can view spaces they own or are members of" ON public.spaces
  FOR SELECT USING (
    owner_user_id = auth.uid()
    OR is_space_member(id, auth.uid())
  );

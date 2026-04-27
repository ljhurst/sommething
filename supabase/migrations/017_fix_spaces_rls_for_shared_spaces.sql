-- Migration 017: Fix spaces RLS policy to allow members to view shared spaces
-- 
-- CRITICAL BUG FIX: The current policy only allows viewing spaces where owner_user_id = auth.uid()
-- This means members added to a space cannot see it at all, breaking space sharing completely.
--
-- This migration updates the SELECT policy to also include spaces where the user is a member.

-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "Users can view spaces they own" ON public.spaces;

-- Create new policy that includes shared spaces
CREATE POLICY "Users can view spaces they own or are members of" ON public.spaces
  FOR SELECT USING (
    owner_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.space_members sm
      WHERE sm.space_id = public.spaces.id 
      AND sm.user_id = auth.uid()
    )
  );

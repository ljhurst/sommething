-- Migration 016: Comprehensive RLS fix to eliminate all recursion
-- Key principle: Avoid querying space_members from policies that space_members depends on

-- ============================================================================
-- DROP ALL POLICIES TO START FRESH
-- ============================================================================
DROP POLICY IF EXISTS "Users can view wines they created or in their spaces" ON public.wines;
DROP POLICY IF EXISTS "Users can create wines" ON public.wines;
DROP POLICY IF EXISTS "Users can update wines they created" ON public.wines;
DROP POLICY IF EXISTS "Users can delete wines they created" ON public.wines;

DROP POLICY IF EXISTS "Users can view spaces they own or are members of" ON public.spaces;
DROP POLICY IF EXISTS "Users can create spaces" ON public.spaces;
DROP POLICY IF EXISTS "Users can update spaces they own" ON public.spaces;
DROP POLICY IF EXISTS "Users can delete spaces they own" ON public.spaces;

DROP POLICY IF EXISTS "Users can view members of their spaces" ON public.space_members;
DROP POLICY IF EXISTS "Space owners can add members" ON public.space_members;
DROP POLICY IF EXISTS "Space owners can update member roles" ON public.space_members;
DROP POLICY IF EXISTS "Space owners can remove members or users can leave" ON public.space_members;

DROP POLICY IF EXISTS "Users can view bottles in their spaces" ON public.bottle_instances;
DROP POLICY IF EXISTS "Users can add bottles to their spaces" ON public.bottle_instances;
DROP POLICY IF EXISTS "Users can update bottles in their spaces" ON public.bottle_instances;
DROP POLICY IF EXISTS "Users can delete bottles from their spaces" ON public.bottle_instances;

DROP POLICY IF EXISTS "Users can view consumptions from their spaces" ON public.consumptions;
DROP POLICY IF EXISTS "Users can record consumptions in their spaces" ON public.consumptions;
DROP POLICY IF EXISTS "Users can update their own consumptions" ON public.consumptions;
DROP POLICY IF EXISTS "Users can delete their own consumptions" ON public.consumptions;

-- ============================================================================
-- SPACES TABLE POLICIES (No dependencies - start here)
-- ============================================================================
-- Users can see spaces they own OR spaces where they are explicitly a member
-- This is the foundation - no recursion here
CREATE POLICY "Users can view spaces they own" ON public.spaces
  FOR SELECT USING (owner_user_id = auth.uid());

CREATE POLICY "Users can create spaces" ON public.spaces
  FOR INSERT WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Users can update spaces they own" ON public.spaces
  FOR UPDATE USING (owner_user_id = auth.uid());

CREATE POLICY "Users can delete spaces they own" ON public.spaces
  FOR DELETE USING (owner_user_id = auth.uid());

-- ============================================================================
-- SPACE_MEMBERS TABLE POLICIES (Depends only on spaces - no recursion)
-- ============================================================================
-- Users can see members of spaces they own, OR see their own membership record
CREATE POLICY "Users can view members of spaces they own or their own membership" ON public.space_members
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.spaces s
      WHERE s.id = public.space_members.space_id 
      AND s.owner_user_id = auth.uid()
    )
  );

CREATE POLICY "Space owners can add members" ON public.space_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.spaces s
      WHERE s.id = public.space_members.space_id 
      AND s.owner_user_id = auth.uid()
    )
  );

CREATE POLICY "Space owners can update member roles" ON public.space_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.spaces s
      WHERE s.id = public.space_members.space_id 
      AND s.owner_user_id = auth.uid()
    )
  );

CREATE POLICY "Space owners can remove members or users can leave" ON public.space_members
  FOR DELETE USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.spaces s
      WHERE s.id = public.space_members.space_id 
      AND s.owner_user_id = auth.uid()
    )
  );

-- ============================================================================
-- WINES TABLE POLICIES (Can now safely query space_members)
-- ============================================================================
CREATE POLICY "Users can view wines they created or in member spaces" ON public.wines
  FOR SELECT USING (
    created_by_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.bottle_instances bi
      INNER JOIN public.space_members sm ON sm.space_id = bi.space_id
      WHERE bi.wine_id = public.wines.id AND sm.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.consumptions c
      INNER JOIN public.space_members sm ON sm.space_id = c.space_id
      WHERE c.wine_id = public.wines.id AND sm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create wines" ON public.wines
  FOR INSERT WITH CHECK (created_by_user_id = auth.uid());

CREATE POLICY "Users can update wines they created" ON public.wines
  FOR UPDATE USING (created_by_user_id = auth.uid());

CREATE POLICY "Users can delete wines they created" ON public.wines
  FOR DELETE USING (created_by_user_id = auth.uid());

-- ============================================================================
-- BOTTLE_INSTANCES TABLE POLICIES
-- ============================================================================
CREATE POLICY "Users can view bottles in their spaces" ON public.bottle_instances
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.space_members sm
      WHERE sm.space_id = public.bottle_instances.space_id 
      AND sm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add bottles to their spaces" ON public.bottle_instances
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.space_members sm
      WHERE sm.space_id = public.bottle_instances.space_id 
      AND sm.user_id = auth.uid()
      AND sm.role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Users can update bottles in their spaces" ON public.bottle_instances
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.space_members sm
      WHERE sm.space_id = public.bottle_instances.space_id 
      AND sm.user_id = auth.uid()
      AND sm.role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Users can delete bottles from their spaces" ON public.bottle_instances
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.space_members sm
      WHERE sm.space_id = public.bottle_instances.space_id 
      AND sm.user_id = auth.uid()
      AND sm.role IN ('owner', 'editor')
    )
  );

-- ============================================================================
-- CONSUMPTIONS TABLE POLICIES
-- ============================================================================
CREATE POLICY "Users can view consumptions from their spaces" ON public.consumptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.space_members sm
      WHERE sm.space_id = public.consumptions.space_id 
      AND sm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can record consumptions in their spaces" ON public.consumptions
  FOR INSERT WITH CHECK (
    consumed_by_user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.space_members sm
      WHERE sm.space_id = public.consumptions.space_id 
      AND sm.user_id = auth.uid()
      AND sm.role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Users can update their own consumptions" ON public.consumptions
  FOR UPDATE USING (consumed_by_user_id = auth.uid());

CREATE POLICY "Users can delete their own consumptions" ON public.consumptions
  FOR DELETE USING (consumed_by_user_id = auth.uid());

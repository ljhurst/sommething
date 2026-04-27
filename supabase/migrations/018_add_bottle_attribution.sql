-- Migration 018: Add attribution to bottle instances
--
-- Adds added_by_user_id column to track who added each bottle to a space.
-- This enables showing "Added by [Name]" in the UI and provides audit trail.

-- Add the column (nullable initially for backfill)
ALTER TABLE bottle_instances
ADD COLUMN added_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Backfill existing bottles with the space owner
-- (assumes owner added all existing bottles before sharing was implemented)
UPDATE bottle_instances bi
SET added_by_user_id = s.owner_user_id
FROM spaces s
WHERE bi.space_id = s.id
AND bi.added_by_user_id IS NULL;

-- Make it required going forward (all bottles must have attribution)
ALTER TABLE bottle_instances
ALTER COLUMN added_by_user_id SET NOT NULL;

-- Add index for performance when querying by who added bottles
CREATE INDEX idx_bottle_instances_added_by ON bottle_instances(added_by_user_id);

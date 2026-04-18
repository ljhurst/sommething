-- Migration: Update wine fridge from 30 to 24 bottles
-- This migration updates the slot_position constraint to support 4×6 grid (24 bottles)

-- Drop the old constraint
ALTER TABLE bottles DROP CONSTRAINT IF EXISTS bottles_slot_position_check;

-- Add new constraint for 24 bottles (4 wide, 6 tall)
ALTER TABLE bottles ADD CONSTRAINT bottles_slot_position_check 
  CHECK (slot_position >= 1 AND slot_position <= 24);

-- Optional: If you have bottles in slots 25-30, you'll need to remove or relocate them first
-- DELETE FROM bottles WHERE slot_position > 24;
-- Or manually move them to available slots 1-24

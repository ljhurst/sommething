-- Migration 010: Drop old bottles and consumption_history tables
-- This migration completes the schema normalization by removing the old tables
-- IMPORTANT: Only run this after verifying the data migration was successful!

-- Drop old indexes first
DROP INDEX IF EXISTS idx_bottles_type;
DROP INDEX IF EXISTS idx_bottles_slot;
DROP INDEX IF EXISTS idx_bottles_user;
DROP INDEX IF EXISTS idx_consumption_bottle;
DROP INDEX IF EXISTS idx_consumption_date;
DROP INDEX IF EXISTS idx_consumption_user;

-- Drop old tables
-- Note: CASCADE will drop any dependent objects (constraints, etc.)
DROP TABLE IF EXISTS consumption_history CASCADE;
DROP TABLE IF EXISTS bottles CASCADE;

-- Verification: Confirm old tables are gone
-- Uncomment to verify:
-- SELECT table_name 
-- FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('bottles', 'consumption_history');
-- Should return 0 rows

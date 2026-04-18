-- Make price column nullable in consumption_history table
-- This allows tracking consumed bottles that didn't have a price recorded
ALTER TABLE consumption_history ALTER COLUMN price DROP NOT NULL;

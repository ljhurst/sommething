-- Make price column nullable in bottles table
ALTER TABLE bottles ALTER COLUMN price DROP NOT NULL;

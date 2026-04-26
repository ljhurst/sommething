-- Migration 008: Migrate existing data from bottles and consumption_history to normalized schema
-- This migration preserves all existing data by:
-- 1. Creating a default space for each user
-- 2. Migrating bottles to wines + bottle_instances
-- 3. Migrating consumption_history to consumptions
-- 4. Adding space owners as members

-- Step 1: Create default space for each user with existing bottles
INSERT INTO spaces (owner_user_id, name, description, rows, columns, space_type)
SELECT DISTINCT 
  user_id,
  'My Wine Fridge',
  'Default wine fridge (migrated from previous data)',
  6,  -- 6 rows
  4,  -- 4 columns
  'fridge'
FROM bottles
WHERE user_id IS NOT NULL;

-- Step 2: Add space owners as members with 'owner' role
INSERT INTO space_members (space_id, user_id, role)
SELECT 
  s.id as space_id,
  s.owner_user_id as user_id,
  'owner' as role
FROM spaces s;

-- Step 3: Migrate bottles to wines table (deduplicating where possible)
-- First, create wine records from unique combinations in bottles
INSERT INTO wines (created_by_user_id, winery, name, type, year, price, score, notes, created_at)
SELECT DISTINCT ON (user_id, winery, name, year)
  user_id as created_by_user_id,
  winery,
  name,
  type,
  year,
  price,
  score,
  notes,
  created_at
FROM bottles
WHERE user_id IS NOT NULL
ORDER BY user_id, winery, name, year, created_at ASC;

-- Step 4: Create bottle_instances for each bottle
-- This requires matching bottles to their corresponding wines and spaces
INSERT INTO bottle_instances (wine_id, space_id, slot_position, added_at)
SELECT 
  w.id as wine_id,
  s.id as space_id,
  b.slot_position,
  b.created_at as added_at
FROM bottles b
INNER JOIN wines w ON (
  w.created_by_user_id = b.user_id 
  AND w.winery = b.winery 
  AND w.name = b.name 
  AND w.year = b.year
)
INNER JOIN spaces s ON (
  s.owner_user_id = b.user_id 
  AND s.name = 'My Wine Fridge'
)
WHERE b.user_id IS NOT NULL;

-- Step 5: Migrate consumption_history to consumptions
-- First, ensure wines exist for all consumed bottles
-- (Some consumed bottles might not have corresponding active bottles)
INSERT INTO wines (created_by_user_id, winery, name, type, year, price, score, created_at)
SELECT DISTINCT ON (ch.user_id, ch.winery, ch.name, ch.year)
  ch.user_id as created_by_user_id,
  ch.winery,
  ch.name,
  ch.type,
  ch.year,
  ch.price,
  ch.score,
  ch.consumed_at as created_at
FROM consumption_history ch
WHERE ch.user_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM wines w 
  WHERE w.created_by_user_id = ch.user_id 
  AND w.winery = ch.winery 
  AND w.name = ch.name 
  AND w.year = ch.year
)
ORDER BY ch.user_id, ch.winery, ch.name, ch.year, ch.consumed_at ASC;

-- Step 6: Create consumption records
INSERT INTO consumptions (wine_id, consumed_by_user_id, space_id, consumed_at, notes, rating)
SELECT 
  w.id as wine_id,
  ch.user_id as consumed_by_user_id,
  s.id as space_id,
  ch.consumed_at,
  ch.consumption_notes as notes,
  ch.consumption_rating as rating
FROM consumption_history ch
INNER JOIN wines w ON (
  w.created_by_user_id = ch.user_id 
  AND w.winery = ch.winery 
  AND w.name = ch.name 
  AND w.year = ch.year
)
INNER JOIN spaces s ON (
  s.owner_user_id = ch.user_id 
  AND s.name = 'My Wine Fridge'
)
WHERE ch.user_id IS NOT NULL;

-- Verification queries (commented out, uncomment to verify)
-- SELECT COUNT(*) as wines_created FROM wines;
-- SELECT COUNT(*) as spaces_created FROM spaces;
-- SELECT COUNT(*) as space_members_created FROM space_members;
-- SELECT COUNT(*) as bottle_instances_created FROM bottle_instances;
-- SELECT COUNT(*) as consumptions_created FROM consumptions;

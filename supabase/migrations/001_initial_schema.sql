-- Create wine type enum
CREATE TYPE wine_type AS ENUM ('red', 'white', 'rose', 'sparkling', 'dessert', 'other');

-- Create rating enum
CREATE TYPE rating_type AS ENUM ('thumbs_up', 'thumbs_down');

-- Create bottles table
CREATE TABLE bottles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  winery TEXT NOT NULL,
  name TEXT NOT NULL,
  type wine_type NOT NULL,
  year INTEGER NOT NULL CHECK (year >= 1900 AND year <= 2100),
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  score INTEGER CHECK (score >= 0 AND score <= 100),
  notes TEXT,
  rating rating_type,
  slot_position INTEGER NOT NULL CHECK (slot_position >= 1 AND slot_position <= 24),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(slot_position)
);

-- Create consumption_history table
CREATE TABLE consumption_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bottle_id UUID NOT NULL REFERENCES bottles(id) ON DELETE CASCADE,
  consumed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  rating rating_type
);

-- Create indexes for better query performance
CREATE INDEX idx_bottles_type ON bottles(type);
CREATE INDEX idx_bottles_slot ON bottles(slot_position);
CREATE INDEX idx_consumption_bottle ON consumption_history(bottle_id);
CREATE INDEX idx_consumption_date ON consumption_history(consumed_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE bottles ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumption_history ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no auth for now)
CREATE POLICY "Allow all operations on bottles" ON bottles
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on consumption_history" ON consumption_history
  FOR ALL USING (true) WITH CHECK (true);

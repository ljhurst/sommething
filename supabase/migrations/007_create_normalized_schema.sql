-- Migration 007: Create normalized schema for wines, spaces, and bottle instances
-- This migration creates the foundation for a normalized data model that separates
-- wine vintages from physical bottle instances and supports multiple spaces.

-- Create wines table (canonical wine vintage metadata)
CREATE TABLE wines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  winery TEXT NOT NULL,
  name TEXT NOT NULL,
  type wine_type NOT NULL,
  year INTEGER NOT NULL CHECK (year >= 1900 AND year <= 2100),
  price DECIMAL(10, 2) CHECK (price >= 0),
  score INTEGER CHECK (score >= 0 AND score <= 100),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create spaces table (fridges, cellars, racks)
CREATE TABLE spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  rows INTEGER NOT NULL CHECK (rows >= 1 AND rows <= 100),
  columns INTEGER NOT NULL CHECK (columns >= 1 AND columns <= 100),
  space_type TEXT NOT NULL DEFAULT 'fridge',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create space_members table (collaboration/sharing)
CREATE TABLE space_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(space_id, user_id)
);

-- Create bottle_instances table (physical bottles in spaces)
CREATE TABLE bottle_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wine_id UUID NOT NULL REFERENCES wines(id) ON DELETE CASCADE,
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  slot_position INTEGER NOT NULL CHECK (slot_position >= 1),
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(space_id, slot_position)
);

-- Create consumptions table (consumption history)
CREATE TABLE consumptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wine_id UUID NOT NULL REFERENCES wines(id) ON DELETE CASCADE,
  consumed_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  consumed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  rating rating_type
);

-- Create indexes for better query performance
CREATE INDEX idx_wines_created_by ON wines(created_by_user_id);
CREATE INDEX idx_wines_type ON wines(type);
CREATE INDEX idx_wines_winery ON wines(winery);
CREATE INDEX idx_wines_year ON wines(year);

CREATE INDEX idx_spaces_owner ON spaces(owner_user_id);

CREATE INDEX idx_space_members_space ON space_members(space_id);
CREATE INDEX idx_space_members_user ON space_members(user_id);

CREATE INDEX idx_bottle_instances_wine ON bottle_instances(wine_id);
CREATE INDEX idx_bottle_instances_space ON bottle_instances(space_id);
CREATE INDEX idx_bottle_instances_slot ON bottle_instances(space_id, slot_position);

CREATE INDEX idx_consumptions_wine ON consumptions(wine_id);
CREATE INDEX idx_consumptions_user ON consumptions(consumed_by_user_id);
CREATE INDEX idx_consumptions_space ON consumptions(space_id);
CREATE INDEX idx_consumptions_date ON consumptions(consumed_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE wines ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE space_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE bottle_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumptions ENABLE ROW LEVEL SECURITY;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_wines_updated_at
  BEFORE UPDATE ON wines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spaces_updated_at
  BEFORE UPDATE ON spaces
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

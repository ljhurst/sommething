-- Add user_id column to bottles table
ALTER TABLE bottles ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to consumption_history table
ALTER TABLE consumption_history ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX idx_bottles_user ON bottles(user_id);
CREATE INDEX idx_consumption_user ON consumption_history(user_id);

-- Update RLS policies for bottles table
DROP POLICY IF EXISTS "Allow all operations on bottles" ON bottles;

CREATE POLICY "Users can view their own bottles" ON bottles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bottles" ON bottles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bottles" ON bottles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bottles" ON bottles
  FOR DELETE USING (auth.uid() = user_id);

-- Update RLS policies for consumption_history table
DROP POLICY IF EXISTS "Allow all operations on consumption_history" ON consumption_history;

CREATE POLICY "Users can view their own consumption history" ON consumption_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consumption history" ON consumption_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own consumption history" ON consumption_history
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own consumption history" ON consumption_history
  FOR DELETE USING (auth.uid() = user_id);

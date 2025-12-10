-- Migration 011: Add level_id to lessons and create user_level_progress table

-- Add level_id column to lessons table
ALTER TABLE lessons
  ADD COLUMN level_id TEXT REFERENCES levels(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX idx_lessons_level_id ON lessons(level_id);

-- Add comment
COMMENT ON COLUMN lessons.level_id IS 'ID of the level this lesson belongs to';

-- Create user_level_progress table for tracking level completion
CREATE TABLE IF NOT EXISTS user_level_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  level_id TEXT NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  bonus_xp_awarded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Ensure one progress record per user per level
  UNIQUE(user_id, level_id)
);

-- Add table comment
COMMENT ON TABLE user_level_progress IS 'Tracks user progress and completion status for each level';
COMMENT ON COLUMN user_level_progress.is_completed IS 'True when all lessons in the level are completed';
COMMENT ON COLUMN user_level_progress.bonus_xp_awarded IS 'True when bonus XP has been awarded for completing the level';

-- Create indexes for performance
CREATE INDEX idx_user_level_progress_user_id ON user_level_progress(user_id);
CREATE INDEX idx_user_level_progress_level_id ON user_level_progress(level_id);
CREATE INDEX idx_user_level_progress_completed ON user_level_progress(user_id, is_completed);

-- Enable RLS
ALTER TABLE user_level_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_level_progress table

-- 1. Users can view their own progress
CREATE POLICY "Users can view their own level progress"
  ON user_level_progress FOR SELECT
  USING (auth.uid() = user_id);

-- 2. Users can insert their own progress
CREATE POLICY "Users can insert their own level progress"
  ON user_level_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Users can update their own progress
CREATE POLICY "Users can update their own level progress"
  ON user_level_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- 4. Admins can view all progress
CREATE POLICY "Admins can view all level progress"
  ON user_level_progress FOR SELECT
  USING (is_admin());

-- 5. Admins can update all progress
CREATE POLICY "Admins can update all level progress"
  ON user_level_progress FOR UPDATE
  USING (is_admin());

-- Create updated_at trigger
CREATE TRIGGER update_user_level_progress_updated_at
  BEFORE UPDATE ON user_level_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

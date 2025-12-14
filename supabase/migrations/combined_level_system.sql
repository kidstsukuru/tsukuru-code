-- Combined Migrations for Level System
-- Generated at: 2025-12-09T16:03:44.703Z
-- Execute this in Supabase SQL Editor


-- ===== supabase/migrations/010_create_levels_table.sql =====

-- Migration 010: Create levels table for 3-tier learning structure
-- This introduces a level layer between courses and lessons
-- Structure: Course → Level → Lessons

-- Create levels table
CREATE TABLE IF NOT EXISTS levels (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,kaw
  description TEXT,
  level_number INTEGER NOT NULL,
  bonus_xp INTEGER NOT NULL DEFAULT 50,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Ensure unique level numbers per course
  UNIQUE(course_id, level_number)
);

-- Add table comment
COMMENT ON TABLE levels IS 'Levels within courses - intermediate layer between courses and lessons';
COMMENT ON COLUMN levels.level_number IS 'Sequential number for ordering levels within a course (1, 2, 3...)';
COMMENT ON COLUMN levels.bonus_xp IS 'Bonus XP awarded when all lessons in the level are completed';

-- Create indexes for performance
CREATE INDEX idx_levels_course_id ON levels(course_id);
CREATE INDEX idx_levels_level_number ON levels(course_id, level_number);
CREATE INDEX idx_levels_published ON levels(is_published);

-- Enable RLS
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;

-- RLS Policies for levels table

-- 1. Anyone can view published levels
CREATE POLICY "Anyone can view published levels"
  ON levels FOR SELECT
  USING (is_published = true);

-- 2. Admins can view all levels (published and unpublished)
CREATE POLICY "Admins can view all levels"
  ON levels FOR SELECT
  USING (is_admin());

-- 3. Admins can insert levels
CREATE POLICY "Admins can insert levels"
  ON levels FOR INSERT
  WITH CHECK (is_admin());

-- 4. Admins can update levels
CREATE POLICY "Admins can update levels"
  ON levels FOR UPDATE
  USING (is_admin());

-- 5. Admins can delete levels
CREATE POLICY "Admins can delete levels"
  ON levels FOR DELETE
  USING (is_admin());

-- Create updated_at trigger
CREATE TRIGGER update_levels_updated_at
  BEFORE UPDATE ON levels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();



-- ===== supabase/migrations/011_add_level_to_lessons.sql =====

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



-- ===== supabase/migrations/012_create_initial_levels.sql =====

-- Migration 012: Create Level 1 for all existing courses and migrate lessons

-- Create Level 1 for each existing course
INSERT INTO levels (id, course_id, title, description, level_number, bonus_xp, is_published, created_at, updated_at)
SELECT
  courses.id || '-level-1' AS id,
  courses.id AS course_id,
  'レベル1' AS title,
  'このレベルでは基礎を学びます' AS description,
  1 AS level_number,
  50 AS bonus_xp,
  courses.is_published,
  courses.created_at,
  courses.updated_at
FROM courses;

-- Assign all existing lessons to their course's Level 1
UPDATE lessons
SET level_id = lessons.course_id || '-level-1'
WHERE level_id IS NULL;

-- Add comment about the migration
COMMENT ON TABLE levels IS 'Levels within courses - intermediate layer between courses and lessons. Migration 012 created Level 1 for all existing courses.';



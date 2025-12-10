-- Migration 010: Create levels table for 3-tier learning structure
-- This introduces a level layer between courses and lessons
-- Structure: Course → Level → Lessons

-- Create levels table
CREATE TABLE IF NOT EXISTS levels (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
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

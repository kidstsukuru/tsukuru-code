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

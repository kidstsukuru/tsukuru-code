-- ============================================
-- 最終修正SQL（正しい順序で実行）
-- ============================================
-- 作成日: 2025-12-09
-- 説明: 既存のデータベースをクリーンアップし、最新の状態に更新します
--       テーブルが存在しない場合のエラーを回避します
-- ============================================

-- ============================================
-- 1. 既存テーブルのトリガーを削除
-- ============================================

DROP TRIGGER IF EXISTS audit_lessons_changes ON lessons;
DROP TRIGGER IF EXISTS audit_courses_changes ON courses;

SELECT 'Step 1: Removed existing table triggers' AS status;

-- ============================================
-- 2. 不足しているカラムを追加
-- ============================================

-- Coursesテーブル
ALTER TABLE courses
ADD COLUMN IF NOT EXISTS title_en TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Lessonsテーブル
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS title_en TEXT,
ADD COLUMN IF NOT EXISTS lesson_type TEXT CHECK (lesson_type IN ('video', 'text', 'interactive', 'quiz')) DEFAULT 'text',
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 15,
ADD COLUMN IF NOT EXISTS required_completion BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS youtube_url TEXT;

SELECT 'Step 2: Added missing columns' AS status;

-- ============================================
-- 3. Quizzesテーブルの作成（存在しない場合）
-- ============================================

CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  question_type TEXT CHECK (question_type IN ('multiple_choice', 'code', 'drag_drop')) DEFAULT 'multiple_choice',
  options JSONB,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  points INTEGER DEFAULT 10,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_quizzes_lesson_id ON quizzes(lesson_id);

-- RLS有効化
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

-- updated_atトリガー（quizzesテーブル作成後に実行）
DROP TRIGGER IF EXISTS update_quizzes_updated_at ON quizzes;
CREATE TRIGGER update_quizzes_updated_at
  BEFORE UPDATE ON quizzes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- audit トリガーも削除（quizzesテーブル作成後に実行）
DROP TRIGGER IF EXISTS audit_quizzes_changes ON quizzes;

SELECT 'Step 3: Created quizzes table' AS status;

-- ============================================
-- 4. インデックスの最適化
-- ============================================

CREATE INDEX IF NOT EXISTS idx_lessons_published ON lessons(is_published, order_index);
CREATE INDEX IF NOT EXISTS idx_user_progress_completed ON user_progress(user_id, completed);

SELECT 'Step 4: Optimized indexes' AS status;

-- ============================================
-- 5. RLSポリシーのクリーンアップと再作成
-- ============================================

-- Courses
DROP POLICY IF EXISTS "Anyone can view published courses" ON courses;
DROP POLICY IF EXISTS "Admins can view all courses" ON courses;
DROP POLICY IF EXISTS "Admins can insert courses" ON courses;
DROP POLICY IF EXISTS "Admins can update courses" ON courses;
DROP POLICY IF EXISTS "Admins can delete courses" ON courses;

CREATE POLICY "Anyone can view published courses"
  ON courses FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can view all courses"
  ON courses FOR SELECT
  USING (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid())
    IN ('admin', 'super_admin')
  );

CREATE POLICY "Admins can insert courses"
  ON courses FOR INSERT
  WITH CHECK (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid())
    IN ('admin', 'super_admin')
  );

CREATE POLICY "Admins can update courses"
  ON courses FOR UPDATE
  USING (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid())
    IN ('admin', 'super_admin')
  );

CREATE POLICY "Admins can delete courses"
  ON courses FOR DELETE
  USING (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid())
    = 'super_admin'
  );

-- Lessons
DROP POLICY IF EXISTS "Anyone can view published lessons" ON lessons;
DROP POLICY IF EXISTS "Admins can view all lessons" ON lessons;
DROP POLICY IF EXISTS "Admins can insert lessons" ON lessons;
DROP POLICY IF EXISTS "Admins can update lessons" ON lessons;
DROP POLICY IF EXISTS "Admins can delete lessons" ON lessons;

CREATE POLICY "Anyone can view published lessons"
  ON lessons FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can view all lessons"
  ON lessons FOR SELECT
  USING (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid())
    IN ('admin', 'super_admin')
  );

CREATE POLICY "Admins can insert lessons"
  ON lessons FOR INSERT
  WITH CHECK (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid())
    IN ('admin', 'super_admin')
  );

CREATE POLICY "Admins can update lessons"
  ON lessons FOR UPDATE
  USING (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid())
    IN ('admin', 'super_admin')
  );

CREATE POLICY "Admins can delete lessons"
  ON lessons FOR DELETE
  USING (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid())
    IN ('admin', 'super_admin')
  );

-- Quizzes
DROP POLICY IF EXISTS "Anyone can view quizzes for published lessons" ON quizzes;
DROP POLICY IF EXISTS "Admins can view all quizzes" ON quizzes;
DROP POLICY IF EXISTS "Admins can insert quizzes" ON quizzes;
DROP POLICY IF EXISTS "Admins can update quizzes" ON quizzes;
DROP POLICY IF EXISTS "Admins can delete quizzes" ON quizzes;

CREATE POLICY "Anyone can view quizzes for published lessons"
  ON quizzes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lessons
      WHERE lessons.id = quizzes.lesson_id
      AND lessons.is_published = true
    )
  );

CREATE POLICY "Admins can view all quizzes"
  ON quizzes FOR SELECT
  USING (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid())
    IN ('admin', 'super_admin')
  );

CREATE POLICY "Admins can insert quizzes"
  ON quizzes FOR INSERT
  WITH CHECK (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid())
    IN ('admin', 'super_admin')
  );

CREATE POLICY "Admins can update quizzes"
  ON quizzes FOR UPDATE
  USING (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid())
    IN ('admin', 'super_admin')
  );

CREATE POLICY "Admins can delete quizzes"
  ON quizzes FOR DELETE
  USING (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid())
    IN ('admin', 'super_admin')
  );

-- User Progress
DROP POLICY IF EXISTS "Admins can view all progress" ON user_progress;

CREATE POLICY "Admins can view all progress"
  ON user_progress FOR SELECT
  USING (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid())
    IN ('admin', 'super_admin')
  );

SELECT 'Step 5: RLS policies cleaned up and recreated' AS status;

-- ============================================
-- 6. テーブルコメントの追加
-- ============================================

COMMENT ON TABLE courses IS 'プログラミングコース（例: Scratch入門、Python基礎）';
COMMENT ON TABLE lessons IS 'コース内の個別レッスン';
COMMENT ON TABLE quizzes IS 'レッスン内のクイズ問題';
COMMENT ON TABLE user_progress IS 'ユーザーのレッスン進捗状況';
COMMENT ON TABLE badge_templates IS 'バッジのテンプレート定義';
COMMENT ON TABLE user_badges IS 'ユーザーが獲得したバッジ';

SELECT 'Step 6: Added table comments' AS status;

-- ============================================
-- 7. データの整合性チェック
-- ============================================

UPDATE lessons SET duration_minutes = 15 WHERE duration_minutes IS NULL;
UPDATE lessons SET lesson_type = 'text' WHERE lesson_type IS NULL;
UPDATE lessons SET required_completion = false WHERE required_completion IS NULL;

SELECT 'Step 7: Data integrity checks completed' AS status;

-- ============================================
-- 完了メッセージ
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Database setup completed successfully!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Completed steps:';
  RAISE NOTICE '  1. Removed existing triggers';
  RAISE NOTICE '  2. Added missing columns';
  RAISE NOTICE '  3. Created quizzes table';
  RAISE NOTICE '  4. Optimized indexes';
  RAISE NOTICE '  5. Fixed RLS policies';
  RAISE NOTICE '  6. Added table comments';
  RAISE NOTICE '  7. Data integrity checks';
  RAISE NOTICE '';
  RAISE NOTICE 'Your database is now ready!';
  RAISE NOTICE 'You can now update lessons from the admin panel.';
  RAISE NOTICE '========================================';
END $$;

-- 最終確認クエリ
SELECT
  'Courses' AS table_name,
  COUNT(*) AS row_count,
  COUNT(CASE WHEN is_published = true THEN 1 END) AS published_count
FROM courses
UNION ALL
SELECT
  'Lessons',
  COUNT(*),
  COUNT(CASE WHEN is_published = true THEN 1 END)
FROM lessons
UNION ALL
SELECT
  'Quizzes',
  COUNT(*),
  NULL
FROM quizzes
UNION ALL
SELECT
  'Users',
  COUNT(*),
  COUNT(CASE WHEN raw_user_meta_data->>'role' IN ('admin', 'super_admin') THEN 1 END) AS admin_count
FROM auth.users;

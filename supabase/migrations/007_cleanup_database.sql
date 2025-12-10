-- ============================================
-- データベース整理・クリーンアップSQL
-- ============================================
-- 作成日: 2025-12-09
-- 説明: 未使用のテーブルとカラムを削除し、データベースを整理します
--
-- 削除対象:
-- - admin_audit_log テーブル (未使用)
-- - quizzes テーブル (当面不要)
-- - users.badges, users.progress (冗長)
-- - courses.title_en, thumbnail_url, created_by (未使用)
-- - lessons.title_en, lesson_type, required_completion (未使用)
-- ============================================

-- ============================================
-- 1. バックアップ確認メッセージ
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Database Cleanup Started';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'IMPORTANT: This will delete tables and columns.';
  RAISE NOTICE 'Please ensure you have a backup if needed.';
  RAISE NOTICE '========================================';
END $$;

-- ============================================
-- 2. RLSポリシーとトリガーの削除
-- ============================================

-- Quizzes関連のポリシーとトリガーを削除
DROP POLICY IF EXISTS "Anyone can view quizzes for published lessons" ON quizzes;
DROP POLICY IF EXISTS "Admins can view all quizzes" ON quizzes;
DROP POLICY IF EXISTS "Admins can insert quizzes" ON quizzes;
DROP POLICY IF EXISTS "Admins can update quizzes" ON quizzes;
DROP POLICY IF EXISTS "Admins can delete quizzes" ON quizzes;
DROP TRIGGER IF EXISTS update_quizzes_updated_at ON quizzes;

-- Admin audit log関連のポリシーを削除
DROP POLICY IF EXISTS "Admins can view audit logs" ON admin_audit_log;
DROP POLICY IF EXISTS "System can insert audit logs" ON admin_audit_log;

SELECT 'Step 1: Removed RLS policies and triggers' AS status;

-- ============================================
-- 3. 未使用テーブルの削除
-- ============================================

-- Quizzesテーブルを削除（外部キー制約を含む）
DROP TABLE IF EXISTS quizzes CASCADE;

-- Admin audit logテーブルを削除
DROP TABLE IF EXISTS admin_audit_log CASCADE;

SELECT 'Step 2: Removed unused tables (quizzes, admin_audit_log)' AS status;

-- ============================================
-- 4. 冗長・未使用カラムの削除
-- ============================================

-- Usersテーブルから冗長なカラムを削除
ALTER TABLE users
DROP COLUMN IF EXISTS badges,
DROP COLUMN IF EXISTS progress;

SELECT 'Step 3: Cleaned up users table' AS status;

-- Coursesテーブルから未使用カラムを削除
ALTER TABLE courses
DROP COLUMN IF EXISTS title_en,
DROP COLUMN IF EXISTS thumbnail_url,
DROP COLUMN IF EXISTS created_by;

SELECT 'Step 4: Cleaned up courses table' AS status;

-- Lessonsテーブルから未使用カラムを削除
ALTER TABLE lessons
DROP COLUMN IF EXISTS title_en,
DROP COLUMN IF EXISTS lesson_type,
DROP COLUMN IF EXISTS required_completion;

SELECT 'Step 5: Cleaned up lessons table' AS status;

-- ============================================
-- 5. テーブルコメントの更新
-- ============================================

COMMENT ON TABLE users IS 'ユーザー情報（名前、XP、レベル、ログイン記録）';
COMMENT ON TABLE courses IS 'プログラミングコース';
COMMENT ON TABLE lessons IS 'コース内のレッスン';
COMMENT ON TABLE user_progress IS 'ユーザーの学習進捗';
COMMENT ON TABLE badge_templates IS 'バッジテンプレート定義';
COMMENT ON TABLE user_badges IS 'ユーザーが獲得したバッジ';

SELECT 'Step 6: Updated table comments' AS status;

-- ============================================
-- 6. インデックスの最適化
-- ============================================

-- 不要なインデックスが残っている場合は削除
DROP INDEX IF EXISTS idx_quizzes_lesson_id;

SELECT 'Step 7: Cleaned up indexes' AS status;

-- ============================================
-- 完了メッセージと最終確認
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Database Cleanup Completed!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Completed steps:';
  RAISE NOTICE '  1. Removed RLS policies and triggers';
  RAISE NOTICE '  2. Deleted unused tables (quizzes, admin_audit_log)';
  RAISE NOTICE '  3. Removed redundant columns from users table';
  RAISE NOTICE '  4. Removed unused columns from courses table';
  RAISE NOTICE '  5. Removed unused columns from lessons table';
  RAISE NOTICE '  6. Updated table comments';
  RAISE NOTICE '  7. Cleaned up indexes';
  RAISE NOTICE '';
  RAISE NOTICE 'Remaining tables: 6';
  RAISE NOTICE '  - users';
  RAISE NOTICE '  - courses';
  RAISE NOTICE '  - lessons';
  RAISE NOTICE '  - user_progress';
  RAISE NOTICE '  - badge_templates';
  RAISE NOTICE '  - user_badges';
  RAISE NOTICE '========================================';
END $$;

-- ============================================
-- 最終確認クエリ
-- ============================================

-- 残っているテーブル一覧
SELECT
  tablename as table_name,
  tableowner as owner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 各テーブルのカラム数
SELECT
  table_name,
  COUNT(*) as column_count
FROM information_schema.columns
WHERE table_schema = 'public'
GROUP BY table_name
ORDER BY table_name;

-- データ件数の確認
SELECT
  'users' AS table_name,
  COUNT(*) AS row_count
FROM users
UNION ALL
SELECT 'courses', COUNT(*) FROM courses
UNION ALL
SELECT 'lessons', COUNT(*) FROM lessons
UNION ALL
SELECT 'user_progress', COUNT(*) FROM user_progress
UNION ALL
SELECT 'badge_templates', COUNT(*) FROM badge_templates
UNION ALL
SELECT 'user_badges', COUNT(*) FROM user_badges
ORDER BY table_name;

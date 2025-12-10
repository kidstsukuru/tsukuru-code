-- ============================================
-- 全テーブルのRLSポリシー修正
-- ============================================
-- 作成日: 2025-12-09
-- 説明: auth.usersへの直接アクセスを関数呼び出しに変更し、
--       権限エラーを解決します
-- ============================================

-- ============================================
-- 1. Courses テーブルのRLSポリシー修正
-- ============================================

DROP POLICY IF EXISTS "Admins can view all courses" ON courses;
DROP POLICY IF EXISTS "Admins can insert courses" ON courses;
DROP POLICY IF EXISTS "Admins can update courses" ON courses;
DROP POLICY IF EXISTS "Admins can delete courses" ON courses;

CREATE POLICY "Admins can view all courses"
  ON courses FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can insert courses"
  ON courses FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update courses"
  ON courses FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete courses"
  ON courses FOR DELETE
  USING (is_super_admin());

SELECT 'Step 1: Fixed courses RLS policies' AS status;

-- ============================================
-- 2. Lessons テーブルのRLSポリシー修正
-- ============================================

DROP POLICY IF EXISTS "Admins can view all lessons" ON lessons;
DROP POLICY IF EXISTS "Admins can insert lessons" ON lessons;
DROP POLICY IF EXISTS "Admins can update lessons" ON lessons;
DROP POLICY IF EXISTS "Admins can delete lessons" ON lessons;

CREATE POLICY "Admins can view all lessons"
  ON lessons FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can insert lessons"
  ON lessons FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update lessons"
  ON lessons FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete lessons"
  ON lessons FOR DELETE
  USING (is_admin());

SELECT 'Step 2: Fixed lessons RLS policies' AS status;

-- ============================================
-- 3. User Progress テーブルのRLSポリシー修正
-- ============================================

DROP POLICY IF EXISTS "Admins can view all progress" ON user_progress;

CREATE POLICY "Admins can view all progress"
  ON user_progress FOR SELECT
  USING (is_admin());

SELECT 'Step 3: Fixed user_progress RLS policies' AS status;

-- ============================================
-- 4. Badge Templates テーブルのRLSポリシー確認
-- ============================================

-- Badge templatesテーブルのポリシーも確認して修正が必要なら実行
DROP POLICY IF EXISTS "Admins can manage badge templates" ON badge_templates;

CREATE POLICY "Admins can view badge templates"
  ON badge_templates FOR SELECT
  USING (true);  -- 全員が閲覧可能

CREATE POLICY "Admins can insert badge templates"
  ON badge_templates FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update badge templates"
  ON badge_templates FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete badge templates"
  ON badge_templates FOR DELETE
  USING (is_super_admin());

SELECT 'Step 4: Fixed badge_templates RLS policies' AS status;

-- ============================================
-- 完了メッセージ
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'All RLS Policies Fixed!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Fixed tables:';
  RAISE NOTICE '  - courses (using is_admin/is_super_admin functions)';
  RAISE NOTICE '  - lessons (using is_admin function)';
  RAISE NOTICE '  - user_progress (using is_admin function)';
  RAISE NOTICE '  - badge_templates (using is_admin/is_super_admin functions)';
  RAISE NOTICE '';
  RAISE NOTICE 'All policies now use SECURITY DEFINER functions';
  RAISE NOTICE 'No direct access to auth.users table';
  RAISE NOTICE '========================================';
END $$;

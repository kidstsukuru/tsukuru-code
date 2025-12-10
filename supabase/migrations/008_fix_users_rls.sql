-- ============================================
-- Users テーブル RLS ポリシー修正
-- ============================================
-- 作成日: 2025-12-09
-- 説明: 循環参照を解決するため、関数をSECURITY DEFINERに設定し、
--       RLSポリシーを修正します
-- ============================================

-- ============================================
-- 1. 関数を SECURITY DEFINER に変更
-- ============================================
-- これにより、関数実行時にRLSがバイパスされ、循環参照が解決されます

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM users
  WHERE id = auth.uid();

  RETURN user_role IN ('admin', 'super_admin');
END;
$$;

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM users
  WHERE id = auth.uid();

  RETURN user_role = 'super_admin';
END;
$$;

CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM users
  WHERE id = auth.uid();

  RETURN user_role;
END;
$$;

SELECT 'Step 1: Updated functions to SECURITY DEFINER' AS status;

-- ============================================
-- 2. コメントの追加
-- ============================================

COMMENT ON FUNCTION is_admin() IS '現在のユーザーが管理者かどうかを確認（SECURITY DEFINER でRLSバイパス）';
COMMENT ON FUNCTION is_super_admin() IS '現在のユーザーがスーパー管理者かどうかを確認（SECURITY DEFINER でRLSバイパス）';
COMMENT ON FUNCTION get_my_role() IS '現在のユーザーのロールを取得（SECURITY DEFINER でRLSバイパス）';

SELECT 'Step 2: Added function comments' AS status;

-- ============================================
-- 完了メッセージ
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Users RLS Policy Fix Completed!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Fixed:';
  RAISE NOTICE '  - is_admin() function now uses SECURITY DEFINER';
  RAISE NOTICE '  - is_super_admin() function now uses SECURITY DEFINER';
  RAISE NOTICE '  - get_my_role() function now uses SECURITY DEFINER';
  RAISE NOTICE '';
  RAISE NOTICE 'This resolves the circular reference issue.';
  RAISE NOTICE '========================================';
END $$;

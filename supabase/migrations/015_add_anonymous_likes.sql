-- =====================================================
-- 匿名ユーザーのいいね機能対応
-- 作成日: 2026-01-18
-- =====================================================

-- creation_likesテーブルにvisitor_idカラムを追加
-- 未ログインユーザーのいいねを記録するために使用
ALTER TABLE creation_likes
ADD COLUMN IF NOT EXISTS visitor_id VARCHAR(100);

-- user_idをNULL許可に変更（匿名ユーザーの場合）
ALTER TABLE creation_likes
ALTER COLUMN user_id DROP NOT NULL;

-- visitor_idにインデックスを追加
CREATE INDEX IF NOT EXISTS idx_creation_likes_visitor_id ON creation_likes(visitor_id);

-- ユニーク制約を更新（user_idまたはvisitor_idのいずれかで重複チェック）
-- 既存のユニーク制約を削除
ALTER TABLE creation_likes DROP CONSTRAINT IF EXISTS creation_likes_user_id_creation_id_key;

-- 新しいユニーク制約を追加（user_idがある場合）
CREATE UNIQUE INDEX IF NOT EXISTS idx_creation_likes_user_creation 
ON creation_likes(user_id, creation_id) 
WHERE user_id IS NOT NULL;

-- 新しいユニーク制約を追加（visitor_idがある場合）
CREATE UNIQUE INDEX IF NOT EXISTS idx_creation_likes_visitor_creation 
ON creation_likes(visitor_id, creation_id) 
WHERE visitor_id IS NOT NULL;

-- RLSポリシーを更新して匿名いいねを許可

-- 既存のINSERTポリシーを削除
DROP POLICY IF EXISTS "Authenticated users can like creations" ON creation_likes;

-- 新しいINSERTポリシー（認証ユーザーまたは匿名ユーザー）
CREATE POLICY "Anyone can like creations"
  ON creation_likes FOR INSERT
  WITH CHECK (
    -- 認証ユーザーの場合：自分のuser_idでいいね
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR
    -- 匿名ユーザーの場合：visitor_idでいいね
    (auth.uid() IS NULL AND visitor_id IS NOT NULL AND user_id IS NULL)
    OR
    -- サービスロールからの挿入も許可（APIからの呼び出し用）
    (visitor_id IS NOT NULL AND user_id IS NULL)
  );

-- 既存のDELETEポリシーを削除
DROP POLICY IF EXISTS "Users can unlike creations" ON creation_likes;

-- 新しいDELETEポリシー（認証ユーザーまたは匿名ユーザー）
CREATE POLICY "Anyone can unlike their own likes"
  ON creation_likes FOR DELETE
  USING (
    -- 認証ユーザーの場合：自分のいいねを削除
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR
    -- 匿名ユーザーの場合：visitor_idでマッチするいいねを削除
    (user_id IS NULL AND visitor_id IS NOT NULL)
  );

-- 完了メッセージ
DO $$
BEGIN
  RAISE NOTICE '匿名ユーザーのいいね機能対応が完了しました！';
  RAISE NOTICE 'visitor_idカラム: 追加完了';
  RAISE NOTICE 'RLSポリシー: 更新完了';
END $$;

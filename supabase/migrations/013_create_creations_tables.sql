-- =====================================================
-- クリエイターズワールド用テーブル作成
-- 作成日: 2025-12-10
-- =====================================================

-- =====================================================
-- 1. creations テーブル（作品情報）
-- =====================================================
CREATE TABLE IF NOT EXISTS creations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  code_url TEXT NOT NULL, -- Scratchプロジェクトのリンク、または埋め込みコードのURL
  plays INTEGER DEFAULT 0, -- 再生回数
  likes INTEGER DEFAULT 0, -- いいね数
  is_published BOOLEAN DEFAULT true, -- 公開/非公開
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成（検索性能向上）
CREATE INDEX IF NOT EXISTS idx_creations_user_id ON creations(user_id);
CREATE INDEX IF NOT EXISTS idx_creations_plays ON creations(plays DESC);
CREATE INDEX IF NOT EXISTS idx_creations_likes ON creations(likes DESC);
CREATE INDEX IF NOT EXISTS idx_creations_created_at ON creations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_creations_is_published ON creations(is_published);

-- updated_at自動更新トリガー
CREATE OR REPLACE FUNCTION update_creations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_creations_updated_at
  BEFORE UPDATE ON creations
  FOR EACH ROW
  EXECUTE FUNCTION update_creations_updated_at();

-- =====================================================
-- 2. creation_likes テーブル（いいね管理）
-- =====================================================
CREATE TABLE IF NOT EXISTS creation_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  creation_id UUID NOT NULL REFERENCES creations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- 同じユーザーが同じ作品に複数回いいねできないようにする
  UNIQUE(user_id, creation_id)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_creation_likes_user_id ON creation_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_creation_likes_creation_id ON creation_likes(creation_id);

-- =====================================================
-- 3. creation_plays テーブル（再生履歴）
-- =====================================================
CREATE TABLE IF NOT EXISTS creation_plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- ゲストユーザーも考慮してNULL許可
  creation_id UUID NOT NULL REFERENCES creations(id) ON DELETE CASCADE,
  played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_creation_plays_creation_id ON creation_plays(creation_id);
CREATE INDEX IF NOT EXISTS idx_creation_plays_played_at ON creation_plays(played_at DESC);

-- =====================================================
-- 4. RLS（Row Level Security）ポリシー設定
-- =====================================================

-- creations テーブルのRLS有効化
ALTER TABLE creations ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが公開作品を閲覧可能
CREATE POLICY "Anyone can view published creations"
  ON creations FOR SELECT
  USING (is_published = true);

-- 作成者は自分の作品を閲覧可能（非公開も含む）
CREATE POLICY "Users can view their own creations"
  ON creations FOR SELECT
  USING (auth.uid() = user_id);

-- 認証ユーザーは作品を投稿可能
CREATE POLICY "Authenticated users can create creations"
  ON creations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 作成者は自分の作品を更新可能
CREATE POLICY "Users can update their own creations"
  ON creations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 作成者は自分の作品を削除可能
CREATE POLICY "Users can delete their own creations"
  ON creations FOR DELETE
  USING (auth.uid() = user_id);

-- 管理者は全ての作品を管理可能
CREATE POLICY "Admins can manage all creations"
  ON creations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- creation_likes テーブルのRLS
-- =====================================================
ALTER TABLE creation_likes ENABLE ROW LEVEL SECURITY;

-- 全ユーザーがいいねを閲覧可能
CREATE POLICY "Anyone can view likes"
  ON creation_likes FOR SELECT
  USING (true);

-- 認証ユーザーはいいねを追加可能
CREATE POLICY "Authenticated users can like creations"
  ON creation_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分のいいねを削除可能
CREATE POLICY "Users can unlike creations"
  ON creation_likes FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- creation_plays テーブルのRLS
-- =====================================================
ALTER TABLE creation_plays ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが再生履歴を追加可能
CREATE POLICY "Anyone can record plays"
  ON creation_plays FOR INSERT
  WITH CHECK (true);

-- 再生履歴の閲覧は管理者のみ（プライバシー保護）
CREATE POLICY "Admins can view plays"
  ON creation_plays FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- 5. いいね数・再生回数を自動更新する関数とトリガー
-- =====================================================

-- いいね追加時にcreations.likesをインクリメント
CREATE OR REPLACE FUNCTION increment_creation_likes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE creations
  SET likes = likes + 1
  WHERE id = NEW.creation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_creation_likes
  AFTER INSERT ON creation_likes
  FOR EACH ROW
  EXECUTE FUNCTION increment_creation_likes();

-- いいね削除時にcreations.likesをデクリメント
CREATE OR REPLACE FUNCTION decrement_creation_likes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE creations
  SET likes = GREATEST(likes - 1, 0) -- 0未満にならないようにする
  WHERE id = OLD.creation_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_decrement_creation_likes
  AFTER DELETE ON creation_likes
  FOR EACH ROW
  EXECUTE FUNCTION decrement_creation_likes();

-- 再生時にcreations.playsをインクリメント
CREATE OR REPLACE FUNCTION increment_creation_plays()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE creations
  SET plays = plays + 1
  WHERE id = NEW.creation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_creation_plays
  AFTER INSERT ON creation_plays
  FOR EACH ROW
  EXECUTE FUNCTION increment_creation_plays();

-- =====================================================
-- 6. サンプルデータ投入（開発用）
-- =====================================================

-- 管理者ユーザーのIDを取得（存在する場合のみ）
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- 管理者ユーザーを検索
  SELECT id INTO admin_user_id
  FROM users
  WHERE role IN ('admin', 'super_admin')
  LIMIT 1;

  -- 管理者が存在する場合のみサンプルデータを投入
  IF admin_user_id IS NOT NULL THEN
    -- サンプル作品を投入
    INSERT INTO creations (user_id, title, description, thumbnail_url, code_url, plays, likes, is_published)
    VALUES
      (admin_user_id, 'ギャラクシー・ランナー', '宇宙を駆け抜ける爽快アクションゲーム！', 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=800&auto=format&fit=crop', 'https://scratch.mit.edu/projects/example1', 1024, 256, true),
      (admin_user_id, 'サイバー・メイズ', 'ネオンに彩られた迷路を探検しよう', 'https://images.unsplash.com/photo-1550745165-9bc0b252726a?q=80&w=800&auto=format&fit=crop', 'https://scratch.mit.edu/projects/example2', 876, 192, true),
      (admin_user_id, '時空を超える猫', '時間を巻き戻してパズルを解こう！', 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?q=80&w=800&auto=format&fit=crop', 'https://scratch.mit.edu/projects/example3', 1532, 411, true),
      (admin_user_id, 'ロボット・ファクトリー', 'ロボットを組み立てて工場を運営', 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?q=80&w=800&auto=format&fit=crop', 'https://scratch.mit.edu/projects/example4', 541, 98, true),
      (admin_user_id, 'エイリアン・インベージョン', 'エイリアンの侵略から地球を守れ！', 'https://images.unsplash.com/photo-1610986612456-107ac7533658?q=80&w=800&auto=format&fit=crop', 'https://scratch.mit.edu/projects/example5', 2048, 512, true);

    RAISE NOTICE 'サンプル作品を投入しました（管理者ID: %）', admin_user_id;
  ELSE
    RAISE NOTICE '管理者ユーザーが見つからないため、サンプルデータは投入されませんでした';
  END IF;
END $$;

-- =====================================================
-- 7. 完了メッセージ
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE 'クリエイターズワールド用テーブルの作成が完了しました！';
  RAISE NOTICE 'テーブル: creations, creation_likes, creation_plays';
  RAISE NOTICE 'RLSポリシー: 設定完了';
  RAISE NOTICE '自動更新トリガー: 設定完了';
END $$;

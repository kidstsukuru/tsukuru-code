-- =====================================================
-- サブスクリプションシステム用テーブル作成
-- 作成日: 2025-12-15
-- =====================================================

-- =====================================================
-- 1. plans テーブル（サブスクリプションプラン）
-- =====================================================
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE, -- 'free', 'premium', 'family'
  display_name VARCHAR(100) NOT NULL, -- '無料プラン', 'プレミアムプラン', 'ファミリープラン'
  description TEXT,
  price INTEGER NOT NULL DEFAULT 0, -- 月額料金（円）
  stripe_price_id VARCHAR(100), -- Stripe Price ID
  features JSONB NOT NULL DEFAULT '{}', -- プラン機能の詳細
  limits JSONB NOT NULL DEFAULT '{}', -- 制限事項（コース数、作品数など）
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0, -- 表示順序
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_plans_name ON plans(name);
CREATE INDEX IF NOT EXISTS idx_plans_is_active ON plans(is_active);
CREATE INDEX IF NOT EXISTS idx_plans_display_order ON plans(display_order);

-- updated_at自動更新トリガー
CREATE OR REPLACE FUNCTION update_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_plans_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW
  EXECUTE FUNCTION update_plans_updated_at();

-- =====================================================
-- 2. subscriptions テーブル（ユーザーのサブスクリプション）
-- =====================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
  stripe_customer_id VARCHAR(100), -- Stripe Customer ID
  stripe_subscription_id VARCHAR(100), -- Stripe Subscription ID
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'canceled', 'past_due', 'trialing'
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- 1ユーザーは1つのアクティブなサブスクリプションのみ
  UNIQUE(user_id)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_current_period_end ON subscriptions(current_period_end);

-- updated_at自動更新トリガー
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscriptions_updated_at();

-- =====================================================
-- 3. subscription_history テーブル（サブスクリプション履歴）
-- =====================================================
CREATE TABLE IF NOT EXISTS subscription_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
  action VARCHAR(50) NOT NULL, -- 'created', 'upgraded', 'downgraded', 'canceled', 'renewed', 'payment_failed'
  status_before VARCHAR(20),
  status_after VARCHAR(20),
  amount INTEGER, -- 支払額（円）
  metadata JSONB DEFAULT '{}', -- 追加情報（Stripe Event IDなど）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_subscription_history_user_id ON subscription_history(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_subscription_id ON subscription_history(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_action ON subscription_history(action);
CREATE INDEX IF NOT EXISTS idx_subscription_history_created_at ON subscription_history(created_at DESC);

-- =====================================================
-- 4. family_members テーブル（ファミリープランのメンバー）
-- =====================================================
CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  parent_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- 親アカウント
  child_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- 子アカウント
  nickname VARCHAR(50), -- 子アカウントのニックネーム
  learning_time_limit INTEGER, -- 1日の学習時間制限（分）
  allowed_courses JSONB DEFAULT '[]', -- 許可されたコースID配列
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- 同じ子アカウントは1つのファミリープランのみに所属
  UNIQUE(child_user_id)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_family_members_subscription_id ON family_members(subscription_id);
CREATE INDEX IF NOT EXISTS idx_family_members_parent_user_id ON family_members(parent_user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_child_user_id ON family_members(child_user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_is_active ON family_members(is_active);

-- updated_at自動更新トリガー
CREATE OR REPLACE FUNCTION update_family_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_family_members_updated_at
  BEFORE UPDATE ON family_members
  FOR EACH ROW
  EXECUTE FUNCTION update_family_members_updated_at();

-- =====================================================
-- 5. RLS（Row Level Security）ポリシー設定
-- =====================================================

-- plans テーブルのRLS有効化
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- 全ユーザーがプラン情報を閲覧可能
CREATE POLICY "Anyone can view active plans"
  ON plans FOR SELECT
  USING (is_active = true);

-- 管理者のみプラン管理可能
CREATE POLICY "Admins can manage plans"
  ON plans FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- subscriptions テーブルのRLS
-- =====================================================
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のサブスクリプションを閲覧可能
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- ファミリープランの親は子アカウントのサブスクリプションも閲覧可能
CREATE POLICY "Parents can view family subscriptions"
  ON subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.subscription_id = subscriptions.id
      AND family_members.parent_user_id = auth.uid()
    )
  );

-- 管理者は全サブスクリプションを閲覧可能
CREATE POLICY "Admins can view all subscriptions"
  ON subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- サブスクリプションの作成・更新・削除は管理者のみ（通常はStripe Webhookから）
CREATE POLICY "Admins can manage subscriptions"
  ON subscriptions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- subscription_history テーブルのRLS
-- =====================================================
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分の履歴を閲覧可能
CREATE POLICY "Users can view their own history"
  ON subscription_history FOR SELECT
  USING (auth.uid() = user_id);

-- 管理者は全履歴を閲覧可能
CREATE POLICY "Admins can view all history"
  ON subscription_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- 履歴の作成は管理者のみ
CREATE POLICY "Admins can create history"
  ON subscription_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- family_members テーブルのRLS
-- =====================================================
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

-- 親ユーザーは自分のファミリーメンバーを閲覧・管理可能
CREATE POLICY "Parents can view their family members"
  ON family_members FOR SELECT
  USING (auth.uid() = parent_user_id);

CREATE POLICY "Parents can manage their family members"
  ON family_members FOR ALL
  USING (auth.uid() = parent_user_id)
  WITH CHECK (auth.uid() = parent_user_id);

-- 子ユーザーは自分の情報を閲覧可能
CREATE POLICY "Children can view their own info"
  ON family_members FOR SELECT
  USING (auth.uid() = child_user_id);

-- 管理者は全ファミリーメンバーを管理可能
CREATE POLICY "Admins can manage all family members"
  ON family_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- 6. 初期プランデータ投入
-- =====================================================

-- 無料プラン
INSERT INTO plans (name, display_name, description, price, features, limits, display_order)
VALUES (
  'free',
  '無料プラン',
  'プログラミングを始めるのに最適なプラン',
  0,
  '{
    "courses_access": "limited",
    "max_level": 5,
    "creations_per_month": 5,
    "ads": true,
    "support": "community",
    "badges": false,
    "progress_reports": false,
    "priority_support": false
  }'::jsonb,
  '{
    "max_courses": 3,
    "max_level": 5,
    "creations_per_month": 5
  }'::jsonb,
  1
)
ON CONFLICT (name) DO NOTHING;

-- プレミアムプラン
INSERT INTO plans (name, display_name, description, price, stripe_price_id, features, limits, display_order)
VALUES (
  'premium',
  'プレミアムプラン',
  '全機能を使ってプログラミングをマスター！',
  980,
  NULL, -- 後でStripeダッシュボードで作成したPrice IDを設定
  '{
    "courses_access": "all",
    "max_level": "unlimited",
    "creations_per_month": "unlimited",
    "ads": false,
    "support": "priority",
    "badges": true,
    "progress_reports": true,
    "priority_support": true,
    "priority_response_time": "24h"
  }'::jsonb,
  '{
    "max_courses": null,
    "max_level": null,
    "creations_per_month": null
  }'::jsonb,
  2
)
ON CONFLICT (name) DO NOTHING;

-- ファミリープラン
INSERT INTO plans (name, display_name, description, price, stripe_price_id, features, limits, display_order)
VALUES (
  'family',
  'ファミリープラン',
  '家族みんなで楽しく学べるお得なプラン！',
  1980,
  NULL, -- 後でStripeダッシュボードで作成したPrice IDを設定
  '{
    "courses_access": "all",
    "max_level": "unlimited",
    "creations_per_month": "unlimited",
    "ads": false,
    "support": "priority",
    "badges": true,
    "progress_reports": true,
    "priority_support": true,
    "priority_response_time": "24h",
    "family_accounts": 4,
    "parent_dashboard": true,
    "learning_time_management": true,
    "family_gallery": true
  }'::jsonb,
  '{
    "max_courses": null,
    "max_level": null,
    "creations_per_month": null,
    "max_family_members": 4
  }'::jsonb,
  3
)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 7. ユーザーに無料プランを自動割り当てする関数
-- =====================================================
CREATE OR REPLACE FUNCTION assign_free_plan_to_new_user()
RETURNS TRIGGER AS $$
DECLARE
  free_plan_id UUID;
BEGIN
  -- 無料プランのIDを取得
  SELECT id INTO free_plan_id
  FROM plans
  WHERE name = 'free'
  LIMIT 1;

  -- 無料プランが存在する場合、新規ユーザーに割り当て
  IF free_plan_id IS NOT NULL THEN
    INSERT INTO subscriptions (user_id, plan_id, status, current_period_start)
    VALUES (NEW.id, free_plan_id, 'active', NOW());

    -- 履歴に記録
    INSERT INTO subscription_history (user_id, plan_id, action, status_after)
    VALUES (NEW.id, free_plan_id, 'created', 'active');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 新規ユーザー作成時に無料プランを自動割り当て
CREATE TRIGGER trigger_assign_free_plan_to_new_user
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION assign_free_plan_to_new_user();

-- =====================================================
-- 8. サブスクリプション変更時に履歴を記録する関数
-- =====================================================
CREATE OR REPLACE FUNCTION record_subscription_change()
RETURNS TRIGGER AS $$
BEGIN
  -- ステータスが変更された場合
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO subscription_history (
      user_id,
      subscription_id,
      plan_id,
      action,
      status_before,
      status_after
    )
    VALUES (
      NEW.user_id,
      NEW.id,
      NEW.plan_id,
      CASE
        WHEN NEW.status = 'active' AND OLD.status != 'active' THEN 'renewed'
        WHEN NEW.status = 'canceled' THEN 'canceled'
        ELSE 'status_changed'
      END,
      OLD.status,
      NEW.status
    );
  END IF;

  -- プランが変更された場合
  IF OLD.plan_id IS DISTINCT FROM NEW.plan_id THEN
    INSERT INTO subscription_history (
      user_id,
      subscription_id,
      plan_id,
      action,
      status_before,
      status_after,
      metadata
    )
    VALUES (
      NEW.user_id,
      NEW.id,
      NEW.plan_id,
      CASE
        WHEN (SELECT price FROM plans WHERE id = NEW.plan_id) > (SELECT price FROM plans WHERE id = OLD.plan_id) THEN 'upgraded'
        ELSE 'downgraded'
      END,
      NEW.status,
      NEW.status,
      jsonb_build_object('old_plan_id', OLD.plan_id, 'new_plan_id', NEW.plan_id)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- サブスクリプション更新時に履歴を記録
CREATE TRIGGER trigger_record_subscription_change
  AFTER UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION record_subscription_change();

-- =====================================================
-- 9. 便利なビュー（View）作成
-- =====================================================

-- アクティブなサブスクリプション一覧（プラン情報付き）
CREATE OR REPLACE VIEW active_subscriptions_with_plans AS
SELECT
  s.*,
  p.name as plan_name,
  p.display_name as plan_display_name,
  p.price as plan_price,
  p.features as plan_features,
  p.limits as plan_limits,
  u.email as user_email,
  u.name as user_name
FROM subscriptions s
JOIN plans p ON s.plan_id = p.id
JOIN users u ON s.user_id = u.id
WHERE s.status = 'active';

-- =====================================================
-- 10. 完了メッセージ
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE 'サブスクリプションシステム用テーブルの作成が完了しました！';
  RAISE NOTICE 'テーブル: plans, subscriptions, subscription_history, family_members';
  RAISE NOTICE '初期プラン: 無料プラン、プレミアムプラン (¥980/月)、ファミリープラン (¥1,980/月)';
  RAISE NOTICE 'RLSポリシー: 設定完了';
  RAISE NOTICE '自動トリガー: 新規ユーザーへの無料プラン割り当て、サブスクリプション履歴記録';
  RAISE NOTICE 'ビュー: active_subscriptions_with_plans';
END $$;

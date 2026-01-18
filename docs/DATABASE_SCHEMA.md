# データベーススキーマ設計

最終更新: 2026-01-17

---

## テーブル一覧

| テーブル名 | 説明 |
|-----------|------|
| users | ユーザー情報 |
| courses | コース情報 |
| levels | レベル情報（コース内の中間層） |
| lessons | レッスン情報 |
| user_progress | レッスン進捗 |
| user_level_progress | レベル進捗 |
| badge_templates | バッジテンプレート |
| creations | ユーザー作品 |
| creation_likes | 作品へのいいね |
| plans | サブスクリプションプラン |
| subscriptions | ユーザーサブスクリプション |

---

## users テーブル

ユーザーの基本情報を保存

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | UUID | PRIMARY KEY（auth.usersと連携） |
| name | TEXT | ユーザー名 |
| email | TEXT | メールアドレス（UNIQUE） |
| role | TEXT | ロール（student/admin/super_admin） |
| login_streak | INTEGER | ログイン連続日数 |
| xp | INTEGER | 経験値 |
| level | INTEGER | レベル |
| badges | JSONB | 獲得バッジ情報 |
| avatar_style | TEXT | DiceBearアバタースタイル |
| avatar_seed | TEXT | DiceBearアバターシード |
| is_active | BOOLEAN | アカウント有効状態 |
| created_at | TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | 更新日時 |

---

## courses テーブル

コース情報を保存

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | TEXT | PRIMARY KEY（例: scratch-intro） |
| title | TEXT | コースタイトル |
| description | TEXT | コース説明 |
| icon | TEXT | アイコン（絵文字） |
| difficulty | TEXT | 難易度 |
| estimated_hours | INTEGER | 推定学習時間 |
| is_published | BOOLEAN | 公開状態 |
| order_index | INTEGER | 表示順序 |
| created_at | TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | 更新日時 |

---

## levels テーブル

コース内のレベル（中間層）

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | TEXT | PRIMARY KEY |
| course_id | TEXT | 所属コースID（FK） |
| title | TEXT | レベルタイトル |
| description | TEXT | レベル説明 |
| level_number | INTEGER | 順番（1, 2, 3...） |
| bonus_xp | INTEGER | 完了時ボーナスXP |
| is_published | BOOLEAN | 公開状態 |
| created_at | TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | 更新日時 |

---

## lessons テーブル

レッスン情報を保存

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | TEXT | PRIMARY KEY |
| course_id | TEXT | 所属コースID（FK） |
| level_id | TEXT | 所属レベルID（FK） |
| title | TEXT | レッスンタイトル |
| description | TEXT | レッスン説明 |
| content | JSONB | レッスンコンテンツ（リッチテキスト） |
| youtube_url | TEXT | YouTube動画URL |
| order_index | INTEGER | 表示順序 |
| xp_reward | INTEGER | 完了時XP報酬 |
| duration_minutes | INTEGER | 所要時間（分） |
| is_published | BOOLEAN | 公開状態 |
| created_at | TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | 更新日時 |

---

## user_progress テーブル

レッスン進捗を追跡

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | UUID | PRIMARY KEY |
| user_id | UUID | ユーザーID（FK） |
| lesson_id | TEXT | レッスンID（FK） |
| completed | BOOLEAN | 完了フラグ |
| completed_at | TIMESTAMP | 完了日時 |
| created_at | TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | 更新日時 |

---

## user_level_progress テーブル

レベル進捗を追跡

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | UUID | PRIMARY KEY |
| user_id | UUID | ユーザーID（FK） |
| level_id | TEXT | レベルID（FK） |
| is_completed | BOOLEAN | 完了フラグ |
| completed_at | TIMESTAMP | 完了日時 |
| bonus_xp_awarded | BOOLEAN | ボーナスXP付与済み |
| created_at | TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | 更新日時 |

---

## badge_templates テーブル

バッジの定義

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | TEXT | PRIMARY KEY（例: first-lesson） |
| name | TEXT | バッジ名 |
| description | TEXT | バッジ説明 |
| icon | TEXT | アイコン（絵文字） |
| category | TEXT | カテゴリ |
| condition_type | TEXT | 条件タイプ |
| condition_value | INTEGER | 条件値 |
| xp_reward | INTEGER | 獲得時XP |
| order_index | INTEGER | 表示順序 |
| created_at | TIMESTAMP | 作成日時 |

---

## creations テーブル

ユーザー作品

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | UUID | PRIMARY KEY |
| user_id | UUID | 作成者ID（FK） |
| title | TEXT | 作品タイトル |
| description | TEXT | 作品説明 |
| thumbnail_url | TEXT | サムネイルURL |
| game_url | TEXT | ゲームURL |
| embed_code | TEXT | 埋め込みコード |
| play_count | INTEGER | 再生数 |
| like_count | INTEGER | いいね数 |
| is_published | BOOLEAN | 公開状態 |
| created_at | TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | 更新日時 |

---

## creation_likes テーブル

作品へのいいね

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | UUID | PRIMARY KEY |
| user_id | UUID | ユーザーID（FK） |
| creation_id | UUID | 作品ID（FK） |
| created_at | TIMESTAMP | 作成日時 |

---

## plans テーブル

サブスクリプションプラン

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | UUID | PRIMARY KEY |
| name | TEXT | プラン名（free/basic/premium/family） |
| display_name | TEXT | 表示名 |
| description | TEXT | プラン説明 |
| price | INTEGER | 月額価格（円） |
| features | JSONB | 機能制限 |
| is_active | BOOLEAN | 有効状態 |
| display_order | INTEGER | 表示順序 |

---

## subscriptions テーブル

ユーザーサブスクリプション

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | UUID | PRIMARY KEY |
| user_id | UUID | ユーザーID（FK） |
| plan_id | UUID | プランID（FK） |
| status | TEXT | ステータス（active/canceled等） |
| current_period_start | TIMESTAMP | 現在の期間開始日 |
| current_period_end | TIMESTAMP | 現在の期間終了日 |
| cancel_at_period_end | BOOLEAN | 期間終了時キャンセル |
| canceled_at | TIMESTAMP | キャンセル日時 |
| stripe_customer_id | TEXT | Stripe顧客ID |
| stripe_subscription_id | TEXT | StripeサブスクリプションID |

---

## Row Level Security (RLS)

全テーブルでRLSが有効化されています。

### 基本ポリシー

- **一般ユーザー**: 公開データのみ閲覧、自分のデータのみ更新
- **管理者**: 全データの閲覧・編集
- **スーパー管理者**: 全データの閲覧・編集・削除

### 例: coursesテーブル

```sql
-- 公開コースは誰でも閲覧可能
CREATE POLICY "Anyone can view published courses"
  ON courses FOR SELECT
  USING (is_published = true);

-- 管理者は全コース閲覧可能
CREATE POLICY "Admins can view all courses"
  ON courses FOR SELECT
  USING (is_admin());

-- 管理者のみ作成・更新可能
CREATE POLICY "Admins can insert courses"
  ON courses FOR INSERT
  WITH CHECK (is_admin());
```

---

## マイグレーション

マイグレーションファイルは `supabase/migrations/` に格納:

| ファイル | 内容 |
|---------|------|
| 006_fixed_order.sql | 初期スキーマ |
| 007_cleanup_database.sql | データベースクリーンアップ |
| 008_fix_users_rls.sql | ユーザーRLS修正 |
| 009_fix_all_rls_policies.sql | RLSポリシー修正 |
| 010_create_levels_table.sql | levelsテーブル作成 |
| 011_add_level_to_lessons.sql | レッスンにlevel_id追加 |
| 012_create_initial_levels.sql | 初期レベルデータ |
| 013_create_creations_tables.sql | 作品関連テーブル |
| 014_add_is_active_to_users.sql | ユーザーis_active追加 |
| 015_create_subscription_tables.sql | サブスクリプション関連 |
| 016_create_user_trigger.sql | ユーザー作成トリガー |
| 017_backfill_existing_users.sql | 既存ユーザーバックフィル |

---

## 関連ドキュメント

- [ADMIN_GUIDE.md](./ADMIN_GUIDE.md) - 管理者機能
- [DEVELOPMENT.md](./DEVELOPMENT.md) - 開発環境ガイド

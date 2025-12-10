# データベーススキーマ設計

最終更新: 2025-12-02

---

## 📊 テーブル構成

### 1. `users` テーブル ✅ (実装済み)

ユーザーの基本情報を保存

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PRIMARY KEY | ユーザーID（auth.usersと連携） |
| name | TEXT | NOT NULL | ユーザー名 |
| email | TEXT | NOT NULL, UNIQUE | メールアドレス |
| login_streak | INTEGER | DEFAULT 1 | ログイン連続日数 |
| xp | INTEGER | DEFAULT 0 | 経験値 |
| level | INTEGER | DEFAULT 1 | レベル |
| badges | JSONB | DEFAULT '[]' | 獲得バッジ情報（配列） |
| progress | JSONB | DEFAULT '{}' | 学習進捗情報（オブジェクト） |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新日時 |

**RLSポリシー:**
- ユーザーは自分のデータのみ参照・更新可能

---

### 2. `courses` テーブル

コース情報を保存

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | TEXT | PRIMARY KEY | コースID（例: scratch-intro） |
| title | TEXT | NOT NULL | コースタイトル |
| description | TEXT | | コース説明 |
| icon | TEXT | | アイコン（emoji） |
| difficulty | TEXT | | 難易度（beginner/intermediate/advanced） |
| estimated_hours | INTEGER | | 推定学習時間 |
| is_published | BOOLEAN | DEFAULT false | 公開状態 |
| order_index | INTEGER | DEFAULT 0 | 表示順序 |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新日時 |

**RLSポリシー:**
- 誰でも公開されたコースを参照可能
- 管理者のみ作成・更新可能

---

### 3. `lessons` テーブル

レッスン情報を保存

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | TEXT | PRIMARY KEY | レッスンID（例: lesson-1） |
| course_id | TEXT | NOT NULL, FK | コースID |
| title | TEXT | NOT NULL | レッスンタイトル |
| description | TEXT | | レッスン説明 |
| content | JSONB | | レッスンコンテンツ（HTML/JSON） |
| order_index | INTEGER | DEFAULT 0 | コース内での順序 |
| xp_reward | INTEGER | DEFAULT 10 | クリア時の経験値 |
| is_published | BOOLEAN | DEFAULT false | 公開状態 |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新日時 |

**外部キー:**
- `course_id` → `courses(id)` ON DELETE CASCADE

**RLSポリシー:**
- 誰でも公開されたレッスンを参照可能
- 管理者のみ作成・更新可能

---

### 4. `user_progress` テーブル

ユーザーの学習進捗を保存

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PRIMARY KEY | 進捗ID |
| user_id | UUID | NOT NULL, FK | ユーザーID |
| lesson_id | TEXT | NOT NULL, FK | レッスンID |
| course_id | TEXT | NOT NULL, FK | コースID |
| completed | BOOLEAN | DEFAULT false | 完了フラグ |
| completed_at | TIMESTAMP | | 完了日時 |
| score | INTEGER | | スコア（0-100） |
| attempts | INTEGER | DEFAULT 0 | 試行回数 |
| time_spent | INTEGER | DEFAULT 0 | 学習時間（秒） |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新日時 |

**ユニーク制約:**
- `UNIQUE(user_id, lesson_id)` - 1ユーザー1レッスンにつき1レコード

**外部キー:**
- `user_id` → `users(id)` ON DELETE CASCADE
- `lesson_id` → `lessons(id)` ON DELETE CASCADE
- `course_id` → `courses(id)` ON DELETE CASCADE

**インデックス:**
- `user_id`, `course_id` の複合インデックス（コース進捗確認用）

**RLSポリシー:**
- ユーザーは自分の進捗のみ参照・更新可能

---

### 5. `badge_templates` テーブル

バッジのマスターデータ

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | TEXT | PRIMARY KEY | バッジID（例: login_5_days） |
| name | TEXT | NOT NULL | バッジ名 |
| description | TEXT | | バッジ説明 |
| icon | TEXT | NOT NULL | アイコン（emoji） |
| category | TEXT | | カテゴリ（login/course/achievement） |
| condition_type | TEXT | | 条件タイプ（login_streak/lessons_completed） |
| condition_value | INTEGER | | 条件値 |
| xp_reward | INTEGER | DEFAULT 0 | 獲得時の経験値 |
| order_index | INTEGER | DEFAULT 0 | 表示順序 |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |

**RLSポリシー:**
- 誰でも参照可能
- 管理者のみ作成・更新可能

---

### 6. `user_badges` テーブル

ユーザーが獲得したバッジ

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PRIMARY KEY | レコードID |
| user_id | UUID | NOT NULL, FK | ユーザーID |
| badge_id | TEXT | NOT NULL, FK | バッジID |
| acquired_at | TIMESTAMP | DEFAULT NOW() | 獲得日時 |

**ユニーク制約:**
- `UNIQUE(user_id, badge_id)` - 1ユーザー1バッジにつき1レコード

**外部キー:**
- `user_id` → `users(id)` ON DELETE CASCADE
- `badge_id` → `badge_templates(id)` ON DELETE CASCADE

**RLSポリシー:**
- ユーザーは自分のバッジのみ参照可能
- バッジ獲得時は自分のレコードのみ挿入可能

---

## 🔄 データフロー

### 学習進捗の更新
1. ユーザーがレッスンを完了
2. `user_progress` テーブルに進捗を記録
3. `users` テーブルのXPとレベルを更新
4. 条件達成時にバッジを自動付与

### バッジ獲得
1. 条件チェック（ログイン連続日数、完了レッスン数など）
2. 条件達成時に`user_badges`に挿入
3. `users` テーブルのXPを更新
4. バッジ獲得アニメーションを表示

---

## 📝 実装フェーズ

### Phase 1: 基本テーブル作成 ✅
- [x] `users` テーブル

### Phase 2: コンテンツ管理（今回実装）
- [ ] `courses` テーブル
- [ ] `lessons` テーブル
- [ ] `user_progress` テーブル
- [ ] `badge_templates` テーブル
- [ ] `user_badges` テーブル

### Phase 3: サンプルデータ投入
- [ ] サンプルコースの作成
- [ ] サンプルレッスンの作成
- [ ] バッジテンプレートの作成

### Phase 4: リアルタイム同期
- [ ] Supabase Realtimeの設定
- [ ] 進捗更新のリアルタイム反映
- [ ] バッジ獲得通知

---

## 🔐 セキュリティ考慮事項

1. **Row Level Security (RLS)**
   - すべてのテーブルでRLSを有効化
   - ユーザーは自分のデータのみアクセス可能

2. **データバリデーション**
   - CHECK制約でデータの整合性を保証
   - XPは負の値を取らない
   - スコアは0-100の範囲内

3. **トリガー**
   - `updated_at` の自動更新
   - レベルアップの自動計算
   - バッジ条件の自動チェック

---

## 🚀 パフォーマンス最適化

1. **インデックス**
   - `user_id` による検索を高速化
   - `course_id` と `user_id` の複合インデックス

2. **キャッシュ戦略**
   - コース・レッスン情報はクライアント側でキャッシュ
   - 進捗情報は定期的に同期

3. **クエリ最適化**
   - JOINを使った効率的なデータ取得
   - 必要なカラムのみSELECT

---

**更新履歴**
- 2025-12-02: 初版作成

# Supabase データベーススキーマ

このディレクトリには、Tsukuru Codeプロジェクトのデータベーススキーマとマイグレーションファイルが含まれています。

## 📁 ファイル構成

```
supabase/
├── README.md                          # このファイル
├── schema_current.sql                 # 現在のデータベーススキーマ（最新）
└── migrations/
    └── 007_cleanup_database.sql      # データベースクリーンアップ履歴
```

## 🚀 クイックスタート

### 現在のスキーマを確認する

```bash
# テーブル一覧を表示
node supabase_sql.js tables

# 特定のテーブル構造を確認
node supabase_sql.js describe lessons

# カスタムクエリを実行
node supabase_sql.js exec "SELECT * FROM courses"
```

### スキーマをエクスポートする

現在のデータベース状態を新しいスキーマファイルとして保存したい場合：

```bash
node export_schema.js
```

これにより `schema_current.sql` が最新の状態で更新されます。

## 📊 データベース構成

### テーブル一覧（6テーブル）

| テーブル名 | 説明 | 主要カラム | 行数 |
|-----------|------|-----------|------|
| `users` | ユーザー情報 | id, name, email, xp, level, login_streak | 2 |
| `courses` | プログラミングコース | id, title, description, difficulty, is_published | 3 |
| `lessons` | コース内のレッスン | id, course_id, title, content, duration_minutes | 5 |
| `user_progress` | ユーザーの学習進捗 | user_id, lesson_id, completed, score | 2 |
| `badge_templates` | バッジテンプレート定義 | id, name, category, condition_type | 7 |
| `user_badges` | ユーザー獲得バッジ | user_id, badge_id, acquired_at | 0 |

### 削除されたテーブル（クリーンアップ済み）

以下のテーブルは不要のため削除されました：
- `quizzes` - クイズ機能（当面不要）
- `admin_audit_log` - 管理者監査ログ（未使用）

### RLS (Row Level Security) ポリシー

全てのテーブルでRLSが有効化されています：

- **一般ユーザー**: 公開されたコンテンツのみ閲覧可能
- **管理者 (admin)**: 全てのコンテンツの閲覧・編集が可能
- **スーパー管理者 (super_admin)**: 削除を含む全ての操作が可能

## 🛠️ Claude Code環境での操作

### データ操作ツール（supabase_admin.js）

ユーザーやレッスンデータを操作するツール：

```bash
# ユーザー一覧を表示
node supabase_admin.js users

# レッスン一覧を表示
node supabase_admin.js list

# テーブルスキーマを確認
node supabase_admin.js schema

# レッスンを更新
node supabase_admin.js update lesson-id '{"title":"新しいタイトル"}'

# ユーザーを管理者に設定
node supabase_admin.js set-role user@example.com admin

# 更新のテスト
node supabase_admin.js test-update
```

### SQL実行ツール（supabase_sql.js）

データベースに直接SQLを実行するツール：

```bash
# テーブル一覧
node supabase_sql.js tables

# テーブル構造を確認
node supabase_sql.js describe lessons

# RLSポリシーを確認
node supabase_sql.js policies lessons

# SQLクエリを実行
node supabase_sql.js exec "SELECT * FROM courses WHERE is_published = true"

# SQLファイルを実行
node supabase_sql.js file supabase/migrations/007_cleanup_database.sql
```

### スキーマエクスポートツール（export_schema.js）

現在のデータベーススキーマをファイルに保存：

```bash
node export_schema.js
```

## 🔐 管理者権限の設定

### ユーザーを管理者に昇格させる

```bash
# 方法1: supabase_admin.js を使用（推奨）
node supabase_admin.js set-role user@example.com admin

# 方法2: supabase_sql.js で直接SQL実行
node supabase_sql.js exec "UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{\"role\": \"admin\"}'::jsonb WHERE email = 'user@example.com';"
```

### 管理者ロールの種類

- `user` (デフォルト): 一般ユーザー
- `admin`: 管理者（コンテンツの作成・編集が可能）
- `super_admin`: スーパー管理者（削除を含む全ての操作が可能）

## 🔄 マイグレーション履歴

### 007_cleanup_database.sql（最終実行）
- 未使用テーブルの削除（quizzes, admin_audit_log）
- 冗長カラムの削除（users.badges, users.progress）
- 未使用カラムの削除（courses.title_en, thumbnail_url, created_by）
- 未使用カラムの削除（lessons.title_en, lesson_type, required_completion）
- データベース構造の最適化と正規化

実行日: 2025-12-09

## 📝 重要な注意事項

### データベースの状態

現在のデータベースは以下の状態です：
- ✅ 6つの最適化されたテーブル
- ✅ 冗長なデータが削除され正規化済み
- ✅ 全データが保持されている
- ✅ RLSポリシーが正しく設定されている

### 管理者パネルの使用

管理者パネルでレッスンやコースを編集する際は：
1. ユーザーのロールが `admin` または `super_admin` であることを確認
2. `.env.local` に `VITE_SUPABASE_SERVICE_ROLE_KEY` が設定されていることを確認
3. `services/adminService.ts` がサービスロールキーを使用していることを確認

## 🐛 トラブルシューティング

### レッスン更新時に「0 rows returned」エラー

**原因**: RLSポリシーまたはユーザーロールの問題

**解決方法**:
```bash
# ユーザーロールを確認
node supabase_admin.js users

# adminロールに設定
node supabase_admin.js set-role your@email.com admin
```

### カラムが見つからないエラー

**原因**: データベーススキーマが古い

**解決方法**:
```bash
# 現在のスキーマを確認
node supabase_sql.js describe lessons

# 最新のスキーマと比較
cat supabase/schema_current.sql
```

### 管理者パネルにアクセスできない

**原因**: ユーザーロールが設定されていない

**解決方法**:
```bash
node supabase_admin.js set-role your@email.com admin
```

## 📞 サポート

問題が解決しない場合は、以下を確認してください：

1. **データベース接続を確認**
   ```bash
   node supabase_sql.js tables
   ```

2. **ユーザーロールを確認**
   ```bash
   node supabase_admin.js users
   ```

3. **テーブル構造を確認**
   ```bash
   node supabase_sql.js describe lessons
   ```

4. **RLSポリシーを確認**
   ```bash
   node supabase_sql.js policies lessons
   ```

## 📚 参考リンク

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

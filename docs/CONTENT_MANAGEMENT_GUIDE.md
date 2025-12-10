# 教材管理機能ガイド

## 概要

つくるコード（Tsukuru Code）の教材管理機能により、管理者はコース・レッスンを作成・編集・削除できます。

---

## セットアップ

### 1. Supabaseデータベースの設定

`supabase/migrations/002_add_admin_content_management.sql` のSQLをSupabase Console > SQL Editorで実行してください。

このSQLは以下を実行します：
- `quizzes`テーブルの作成
- 管理者用のRLSポリシーの追加
- 監査ログ機能の強化
- coursesとlessonsテーブルの追加フィールド

### 2. 管理画面へのアクセス

1. 管理者権限のあるアカウントでログイン
2. ダッシュボード右上の「管理画面」ボタンをクリック
3. サイドバーから「コース管理」を選択

---

## 機能の使い方

### コース管理

#### コース一覧
`/admin/courses` で全てのコースを確認できます。

**表示内容:**
- コース名（日本語・英語）
- 説明
- 難易度（初級・中級・上級）
- 推定時間
- 公開状態

**操作:**
- **編集**: コース情報の変更
- **レッスン管理**: そのコースのレッスン一覧へ移動
- **削除**: コースの削除（確認ダイアログ表示）

#### コース作成

「新規コース作成」ボタンをクリックして、以下の情報を入力します：

| フィールド | 必須 | 説明 | 例 |
|-----------|------|------|-----|
| コースID | ✓ | 英小文字・数字・ハイフンのみ | `scratch-intro` |
| コース名（日本語） | ✓ | 表示されるコース名 | `Scratch入門` |
| コース名（英語） | | 英語環境での表示名 | `Introduction to Scratch` |
| アイコン | | 絵文字1文字 | `🎨` |
| 説明 | ✓ | コースの内容説明 | `ブロックを組み合わせるだけで...` |
| 難易度 | ✓ | beginner/intermediate/advanced | `beginner` |
| 推定時間 | ✓ | 完了までの時間（時間） | `5` |
| 表示順序 | ✓ | 小さいほど上に表示 | `0` |
| 公開する | | チェックで即座に公開 | ☑ |

#### コース編集

コース一覧で「編集」ボタンをクリックすると、既存のコース情報を編集できます。

**注意**: コースIDは変更できません。

---

### レッスン管理

#### レッスン一覧

コース管理画面で「レッスン管理」をクリックすると、そのコースのレッスン一覧が表示されます。

**表示内容:**
- レッスン番号（自動採番）
- レッスン名（日本語・英語）
- 説明
- XP報酬
- 所要時間
- 公開状態

**操作:**
- **編集**: レッスン情報の変更
- **クイズ管理**: そのレッスンのクイズ一覧へ移動（次のフェーズで実装）
- **削除**: レッスンの削除（確認ダイアログ表示）

#### レッスン作成

「新規レッスン作成」ボタンをクリックして、以下の情報を入力します：

| フィールド | 必須 | 説明 | 例 |
|-----------|------|------|-----|
| レッスンID | ✓ | 英小文字・数字・ハイフンのみ | `scratch-intro-lesson-1` |
| レッスン名（日本語） | ✓ | 表示されるレッスン名 | `Scratchってなに？` |
| レッスン名（英語） | | 英語環境での表示名 | `What is Scratch?` |
| 説明 | ✓ | レッスンの内容説明 | `Scratchの基本を学ぼう` |
| YouTube URL | | YouTube動画のURL | `https://www.youtube.com/watch?v=xxxxx` |
| XP報酬 | ✓ | 完了時の経験値 | `10` |
| 所要時間 | ✓ | 完了までの時間（分） | `15` |
| 表示順序 | ✓ | 小さいほど上に表示 | `0` |
| 公開する | | チェックで即座に公開 | ☑ |

**推奨ネーミング規則:**
- レッスンID: `{コースID}-lesson-{番号}`
- 例: `scratch-intro-lesson-1`, `scratch-intro-lesson-2`

#### レッスン編集

レッスン一覧で「編集」ボタンをクリックすると、既存のレッスン情報を編集できます。

**注意**: レッスンIDは変更できません。

---

## データベーススキーマ

### coursesテーブル

| カラム | 型 | 説明 |
|--------|-----|------|
| id | TEXT | コースID（主キー） |
| title | TEXT | コース名（日本語） |
| title_en | TEXT | コース名（英語） |
| description | TEXT | 説明 |
| icon | TEXT | アイコン（絵文字） |
| thumbnail_url | TEXT | サムネイル画像URL |
| difficulty | TEXT | 難易度（beginner/intermediate/advanced） |
| estimated_hours | INTEGER | 推定時間 |
| is_published | BOOLEAN | 公開状態 |
| order_index | INTEGER | 表示順序 |
| created_by | UUID | 作成者（管理者ID） |
| created_at | TIMESTAMPTZ | 作成日時 |
| updated_at | TIMESTAMPTZ | 更新日時 |

### lessonsテーブル

| カラム | 型 | 説明 |
|--------|-----|------|
| id | TEXT | レッスンID（主キー） |
| course_id | TEXT | コースID（外部キー） |
| title | TEXT | レッスン名（日本語） |
| title_en | TEXT | レッスン名（英語） |
| description | TEXT | 説明 |
| content | JSONB | レッスンコンテンツ |
| youtube_url | TEXT | YouTube動画URL |
| lesson_type | TEXT | レッスンタイプ（video/text/interactive/quiz） |
| order_index | INTEGER | 表示順序 |
| xp_reward | INTEGER | XP報酬 |
| duration_minutes | INTEGER | 所要時間（分） |
| is_published | BOOLEAN | 公開状態 |
| required_completion | BOOLEAN | 必須完了フラグ |
| created_at | TIMESTAMPTZ | 作成日時 |
| updated_at | TIMESTAMPTZ | 更新日時 |

---

## セキュリティ

### Row Level Security (RLS)

全てのテーブルでRLSが有効化されており、以下のポリシーが適用されています：

**一般ユーザー:**
- 公開されたコース・レッスンのみ閲覧可能

**管理者（admin/super_admin）:**
- 全てのコース・レッスンの閲覧・作成・編集が可能

**スーパー管理者（super_admin）:**
- コースの削除が可能

### 監査ログ

管理者の全ての変更操作は `admin_audit_log` テーブルに自動記録されます：

- 操作タイプ（create/update/delete）
- 対象リソース（course/lesson/quiz）
- 変更内容（JSON）
- 実行日時

---

## トラブルシューティング

### コースが表示されない

**原因**: 公開状態が「非公開」になっている

**対処法**:
1. 管理画面でコースを編集
2. 「公開する」にチェックを入れる
3. 「更新する」をクリック

### レッスンが作成できない

**原因1**: レッスンIDが重複している

**対処法**: 別のレッスンIDを使用してください

**原因2**: 管理者権限がない

**対処法**:
1. Supabase Dashboard > SQL Editor で以下を実行
```sql
UPDATE users
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

### SQLエラーが発生する

**原因**: `002_add_admin_content_management.sql` を実行していない

**対処法**:
1. Supabase Console > SQL Editor を開く
2. `supabase/migrations/002_add_admin_content_management.sql` の内容を貼り付け
3. 実行

---

## 今後の実装予定

### フェーズ3: クイズ管理（未実装）
- クイズ作成フォーム
- 複数の問題形式対応
- 正解率統計表示

### フェーズ4: リッチテキストエディタ
- レッスンコンテンツの編集
- 画像・動画の埋め込み
- プレビュー機能

---

## 関連ドキュメント

- [管理者機能ガイド](./ADMIN_GUIDE.md) - 管理者機能全般
- [データベーススキーマ](./DATABASE_SCHEMA.md) - データベース設計
- [開発ガイド](./DEVELOPMENT.md) - 開発環境の構築

---

**更新履歴**
- 2025-12-04: 初版作成（フェーズ2: 教材管理完了）

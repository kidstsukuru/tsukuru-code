# 管理者機能ガイド

最終更新: 2026-01-17

## 概要

つくるコード（Tsukuru Code）の管理者機能により、プラットフォームの教材、ユーザー、統計データを一元管理できます。

---

## ユーザーロール

### 3つのロール

| ロール | 説明 | 権限 |
|--------|------|------|
| **student** | 一般ユーザー（デフォルト） | 学習コンテンツへのアクセス |
| **admin** | 管理者 | コース/レッスン/ユーザー管理、統計閲覧 |
| **super_admin** | スーパー管理者 | 全機能 + ロール変更、削除操作 |

### 管理者権限の付与

Supabase SQL Editorで実行:

```sql
UPDATE users
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

---

## 管理画面へのアクセス

### アクセス方法

1. **ダッシュボードから** - 右上の「管理画面」ボタン
2. **直接URL**:
   - `/admin` - 管理ダッシュボード
   - `/admin/courses` - コース管理
   - `/admin/users` - ユーザー管理
   - `/admin/analytics` - 分析・統計

### セキュリティ

- 未認証ユーザーはログインページへリダイレクト
- 権限がないユーザーはダッシュボードへリダイレクト
- Supabase RLSによるデータベースレベルの保護

---

## コース管理

### コース一覧 (`/admin/courses`)

全コースの確認・操作が可能です。

**操作:**
- 新規作成
- 編集
- レベル管理へ移動
- 削除（super_adminのみ）

### コース作成

| フィールド | 必須 | 説明 |
|-----------|------|------|
| コースID | Yes | 英小文字・数字・ハイフン（例: `scratch-intro`） |
| コース名 | Yes | 表示名 |
| 説明 | Yes | コース内容の説明 |
| アイコン | No | 絵文字1文字 |
| 難易度 | Yes | beginner / intermediate / advanced |
| 推定時間 | Yes | 完了までの時間（時間） |
| 公開 | No | チェックで公開 |

---

## レベル管理

### 3層構造

```
コース → レベル → レッスン
```

レベルはコース内の中間層で、関連するレッスンをグループ化します。

### レベル作成 (`/admin/courses/:courseId/levels`)

| フィールド | 必須 | 説明 |
|-----------|------|------|
| タイトル | Yes | レベル名（例: 「基礎編」） |
| 説明 | No | レベルの説明 |
| レベル番号 | Yes | 表示順序（1, 2, 3...） |
| ボーナスXP | Yes | レベル完了時の報酬 |
| 公開 | No | チェックで公開 |

---

## レッスン管理

### レッスン作成 (`/admin/courses/:courseId/levels/:levelId/lessons`)

| フィールド | 必須 | 説明 |
|-----------|------|------|
| レッスンID | Yes | 英小文字・数字・ハイフン |
| レッスン名 | Yes | 表示名 |
| 説明 | Yes | レッスンの説明 |
| YouTube URL | No | 動画のURL |
| コンテンツ | No | リッチテキストエディタで編集 |
| XP報酬 | Yes | 完了時の経験値 |
| 所要時間 | Yes | 分単位 |
| 公開 | No | チェックで公開 |

### リッチテキストエディタ

TipTapベースのエディタで以下が利用可能:
- 見出し（H1〜H3）
- 太字、斜体、下線
- リスト（箇条書き、番号付き）
- リンク
- 画像（URLを指定）

---

## ユーザー管理

### ユーザー一覧 (`/admin/users`)

- ユーザー検索
- ロール変更
- アカウント有効/無効化
- 学習進捗の確認

### ロール変更

super_admin のみがロール変更可能です。

---

## 分析・統計 (`/admin/analytics`)

### ダッシュボード統計

- 総ユーザー数
- アクティブユーザー数
- 完了レッスン数
- 平均完了率

### ユーザーアクティビティ

- 日別アクティブユーザー推移
- コース別完了率
- 人気レッスンランキング

---

## ファイル構成

```
/components/admin/
  ├── layout/
  │   ├── AdminSidebar.tsx    # サイドバー
  │   ├── AdminHeader.tsx     # ヘッダー
  │   └── AdminLayout.tsx     # レイアウト
  └── ...

/pages/
  ├── AdminDashboardPage.tsx  # ダッシュボード
  ├── AdminCoursesPage.tsx    # コース一覧
  ├── AdminCourseFormPage.tsx # コース作成/編集
  ├── AdminLevelsPage.tsx     # レベル一覧
  ├── AdminLevelFormPage.tsx  # レベル作成/編集
  ├── AdminLessonsPage.tsx    # レッスン一覧
  ├── AdminLessonFormPage.tsx # レッスン作成/編集
  ├── AdminUsersPage.tsx      # ユーザー管理
  └── AdminAnalyticsPage.tsx  # 分析・統計

/services/
  └── adminService.ts         # 管理者用API

/components/routes/
  └── AdminRoute.tsx          # アクセス制限
```

---

## トラブルシューティング

### 管理画面にアクセスできない

1. ロールを確認:
```sql
SELECT email, role FROM users WHERE email = 'your-email@example.com';
```

2. ロールを変更:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

### コースが表示されない

- `is_published` が `true` になっているか確認
- 管理画面では非公開コースも表示されます

### レッスンが作成できない

- レッスンIDが重複していないか確認
- 管理者権限があるか確認

---

## 関連ドキュメント

- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - データベース設計
- [DEVELOPMENT.md](./DEVELOPMENT.md) - 開発環境ガイド

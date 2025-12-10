# 管理者機能ガイド

## 概要

つくるコード（Tsukuru Code）の管理者機能により、プラットフォームの教材、ユーザー、統計データを一元管理できます。

---

## セットアップ

### 1. Supabaseデータベースの設定

`supabase/migrations/001_add_user_roles.sql` のSQLをSupabase Console > SQL Editorで実行してください。

このSQLは以下を実行します：
- `users`テーブルに`role`カラムを追加
- Row Level Security (RLS) ポリシーの設定
- 監査ログテーブルの作成

### 2. 最初の管理者を作成

SQLファイル内の以下の行を編集して、自分のメールアドレスを設定してください：

```sql
UPDATE users
SET role = 'super_admin'
WHERE email = 'your-email@example.com';  -- ← ここを変更
```

**重要**: このユーザーは事前に登録済みである必要があります。

---

## ユーザーロール

### 3つのロール

1. **student（生徒）**
   - デフォルトのロール
   - 学習コンテンツにアクセス可能
   - 管理機能へのアクセス不可

2. **admin（管理者）**
   - 全ての管理機能にアクセス可能
   - コース・レッスン・クイズの管理
   - ユーザー情報の閲覧
   - 統計データの閲覧

3. **super_admin（スーパー管理者）**
   - 管理者の全機能 + 追加権限
   - 他のユーザーのロール変更
   - システム設定の変更
   - 監査ログの閲覧

---

## 管理画面へのアクセス

### アクセス方法

1. **ダッシュボードから**
   - 管理者ロールを持つユーザーは、ダッシュボード右上に「管理画面」ボタンが表示されます

2. **直接URL**
   - `/admin` - 管理ダッシュボード
   - `/admin/courses` - コース管理
   - `/admin/users` - ユーザー管理
   - `/admin/analytics` - 分析・統計

### セキュリティ

- 未認証ユーザーは自動的にログインページへリダイレクト
- 管理者権限がないユーザーはダッシュボードへリダイレクト
- すべての管理操作はSupabase RLSで二重チェック

---

## 管理画面の構造

### レイアウト

```
┌─────────────┬──────────────────────────────┐
│             │         ヘッダー              │
│  サイドバー  ├──────────────────────────────┤
│             │                              │
│  ナビ        │      メインコンテンツ         │
│             │                              │
└─────────────┴──────────────────────────────┘
```

### サイドバーナビゲーション

- 📊 **管理ダッシュボード** (`/admin`)
  - 概要統計
  - クイックアクション
  - 最近のアクティビティ

- 📚 **コース管理** (`/admin/courses`)
  - コース一覧
  - コース作成・編集・削除
  - レッスン管理

- 👥 **ユーザー管理** (`/admin/users`)
  - ユーザー一覧
  - ユーザー詳細
  - ロール変更

- 📈 **分析・統計** (`/admin/analytics`)
  - ダッシュボード統計
  - コース完了率
  - ユーザーエンゲージメント

---

## 実装状況

### ✅ フェーズ1: 基盤構築（完了）

1. **権限管理システム**
   - ユーザーロール（student, admin, super_admin）
   - Supabase RLSポリシー
   - authStoreでの権限管理

2. **管理画面のルーティング**
   - `AdminRoute`コンポーネントによるアクセス制限
   - 管理画面専用レイアウト
   - 基本的なルート構造

3. **管理ダッシュボード**
   - 統計カードの表示
   - クイックアクション
   - ナビゲーション

### 🚧 フェーズ2: 教材管理機能（次のステップ）

1. **コース管理**
   - コースCRUD操作
   - ドラッグ&ドロップで順序変更
   - 公開/非公開切り替え

2. **レッスンエディタ**
   - リッチテキストエディタ
   - コンテンツブロック管理
   - プレビュー機能

3. **クイズ管理**
   - クイズ作成・編集
   - 複数の問題形式
   - 正解率統計

### 📅 フェーズ3: ユーザー管理（将来）

1. **ユーザー一覧・検索**
2. **ユーザー詳細・編集**
3. **ロール変更**

### 📅 フェーズ4: 分析・統計（将来）

1. **統計ダッシュボード**
2. **コース分析**
3. **ユーザーエンゲージメント**

---

## ファイル構造

```
/components
  /admin
    /layout
      - AdminSidebar.tsx      # サイドバーナビゲーション
      - AdminHeader.tsx       # ヘッダー
      - AdminLayout.tsx       # 共通レイアウト
  /routes
    - AdminRoute.tsx          # アクセス制限コンポーネント

/pages
  - AdminDashboardPage.tsx    # 管理ダッシュボード

/store
  - authStore.ts              # 権限管理を含む認証ストア

/types
  - index.ts                  # 管理機能の型定義

/supabase
  /migrations
    - 001_add_user_roles.sql  # データベース設定SQL
  - schema.sql                # データベーススキーマ
```

---

## コンポーネント使用例

### AdminRoute

管理者専用ルートを保護：

```tsx
<Route path="/admin" element={
  <AdminRoute>
    <AdminLayout>
      <AdminDashboardPage />
    </AdminLayout>
  </AdminRoute>
} />
```

スーパー管理者専用：

```tsx
<Route path="/admin/system" element={
  <AdminRoute requireSuperAdmin={true}>
    <AdminLayout>
      <SystemSettingsPage />
    </AdminLayout>
  </AdminRoute>
} />
```

### 権限チェック

コンポーネント内で権限をチェック：

```tsx
const { isAdmin, isSuperAdmin } = useAuthStore();

return (
  <div>
    {isAdmin && <AdminButton />}
    {isSuperAdmin && <DangerousButton />}
  </div>
);
```

---

## セキュリティベストプラクティス

### フロントエンド

1. **UI制御**
   ```tsx
   {isAdmin && <ManagementButton />}
   ```
   - 管理者以外には管理機能のUIを表示しない

2. **ルート保護**
   ```tsx
   <AdminRoute>{children}</AdminRoute>
   ```
   - 不正アクセスを自動的にリダイレクト

### バックエンド（Supabase）

1. **Row Level Security (RLS)**
   ```sql
   CREATE POLICY "Admins can manage courses" ON courses
     FOR ALL USING (
       EXISTS (
         SELECT 1 FROM users
         WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
       )
     );
   ```
   - データベースレベルで権限を厳格に制御

2. **監査ログ**
   - すべての管理操作を記録
   - 誰が・いつ・何を変更したかを追跡

---

## トラブルシューティング

### 管理画面にアクセスできない

1. **ロールの確認**
   ```sql
   SELECT email, role FROM users WHERE email = 'your-email@example.com';
   ```

2. **ロールの変更（Supabase SQL Editor）**
   ```sql
   UPDATE users
   SET role = 'admin'
   WHERE email = 'your-email@example.com';
   ```

### RLSポリシーエラー

- Supabase Consoleでポリシーが正しく設定されているか確認
- `001_add_user_roles.sql`を再実行

### 管理画面が表示されない

- ブラウザのコンソールでエラーを確認
- `authStore`の`isAdmin`が正しく設定されているか確認

---

## 次のステップ

フェーズ2（教材管理機能）を実装する場合：

1. **Supabaseテーブルの作成**
   - courses
   - lessons
   - quizzes

2. **adminService.tsの作成**
   - CRUD操作のAPI

3. **コース管理UIの実装**
   - コース一覧
   - コース作成フォーム
   - レッスンエディタ

詳細は開発チームにお問い合わせください。

---

## サポート

質問や問題がある場合は、GitHubのIssueで報告してください。

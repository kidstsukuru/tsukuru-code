# 開発環境ガイド

最終更新: 2025-12-02

---

## 🚀 開発サーバーの起動

### 自動起動（推奨）
```bash
npm run dev
```

### 手動で再起動する方法

#### 方法1: プロセスを停止してから起動
```bash
# 1. すべてのviteプロセスを停止
pkill -f "vite"

# 2. プロジェクトディレクトリに移動
cd /Users/nemaseiya/Desktop/プログラミングプロジェクト/tsukuru-code

# 3. 開発サーバーを起動
npm run dev
```

#### 方法2: Ctrl+C で停止（サーバーが既に起動している場合）
```bash
# ターミナルで Ctrl+C を押してサーバーを停止
# その後、再度起動
npm run dev
```

#### 方法3: 特定のポートで起動
```bash
npm run dev -- --port 3000
```

### アクセスURL
- **ローカル**: http://localhost:3001
- **ネットワーク**: http://192.168.2.179:3001 (同じネットワーク内の他のデバイスからアクセス可能)

---

## 📦 本番ビルド

### ビルドコマンド
```bash
npm run build
```

### ビルド結果の確認
```bash
npm run preview
```

### PWAのテスト
```bash
# 本番ビルドを作成
npm run build

# プレビューサーバーで確認（Service Workerが有効化されます）
npm run preview
```

> **注意**: PWA機能（Service Worker、オフライン動作）は本番ビルド（`npm run preview`）でのみ完全に動作します。開発サーバー（`npm run dev`）でも基本的なPWA機能は有効ですが、完全なテストには本番ビルドを使用してください。

### 本番デプロイ先（予定）
- **Vercel** または **Netlify** を推奨
- 環境変数（`.env.local`）は各プラットフォームの設定画面で登録
- HTTPSが必須（PWA要件）

---

## 🔐 テストアカウント情報

### Supabase認証用テストアカウント

#### アカウント1（開発用）
- **名前**: テスト太郎
- **メールアドレス**: taro@example.com
- **パスワード**: password123

#### アカウント2（デバッグ用）
- **名前**: デバッグ花子
- **メールアドレス**: hanako@example.com
- **パスワード**: test123456

> **注意**: これらは開発環境専用のテストアカウントです。本番環境では使用しないでください。

---

## 🗄️ データベース情報

### Supabase

#### プロジェクト情報
- **プロジェクト名**: tsukuru-code
- **リージョン**: Northeast Asia (Tokyo)
- **プロジェクトURL**: https://zbvxkcbpvpbskceogcic.supabase.co

#### ダッシュボードURL
- https://supabase.com/dashboard/project/zbvxkcbpvpbskceogcic

#### 認証設定
- **プロバイダー**: Email/Password
- **メール確認**: オフ（開発環境のため）

#### データベーステーブル

##### `users` テーブル
| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | UUID | ユーザーID（主キー） |
| name | TEXT | ユーザー名 |
| email | TEXT | メールアドレス（ユニーク） |
| login_streak | INTEGER | ログイン連続日数 |
| xp | INTEGER | 経験値 |
| level | INTEGER | レベル |
| badges | JSONB | バッジ情報 |
| progress | JSONB | 学習進捗 |
| created_at | TIMESTAMP | 作成日時 |

---

## 🔑 環境変数

### `.env.local` ファイル

```bash
# Gemini API（将来使用予定）
GEMINI_API_KEY=PLACEHOLDER_API_KEY

# Supabase設定
VITE_SUPABASE_URL=https://zbvxkcbpvpbskceogcic.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpidnhrY2JwdnBic2tjZW9nY2ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2ODAxMjIsImV4cCI6MjA4MDI1NjEyMn0.tEHkUWjAsRFz5eErUK_wND8NDocEg9gsHgEWNnsPGvE
```

> **重要**: `.env.local`ファイルは`.gitignore`に含まれているため、Gitにコミットされません。

---

## 🧪 テスト環境

### ブラウザテスト推奨環境
- **Google Chrome** (最新版)
- **Safari** (macOS/iOS)
- **Firefox** (最新版)

### レスポンシブデザインテスト
```bash
# モバイル表示確認（Chrome DevTools）
1. F12でDevToolsを開く
2. Ctrl+Shift+M（Mac: Cmd+Shift+M）でモバイルビューに切り替え
3. 各デバイスサイズで表示確認
```

### テスト用ページ一覧
- ホームページ: http://localhost:3001/
- ログイン: http://localhost:3001/login
- 新規登録: http://localhost:3001/register
- ダッシュボード: http://localhost:3001/dashboard
- コース: http://localhost:3001/course/scratch-intro
- クリエイターズワールド: http://localhost:3001/creations

---

## 🐛 トラブルシューティング

### ポート3001が既に使用されている
```bash
# 使用中のプロセスを確認
lsof -i :3001

# プロセスを停止
kill -9 <PID>

# または別のポートで起動
npm run dev -- --port 3002
```

### 環境変数が読み込まれない
```bash
# 開発サーバーを完全に再起動
pkill -f "vite"
npm run dev
```

### Supabase接続エラー
1. `.env.local`ファイルの内容を確認
2. Supabaseダッシュボードでプロジェクトが稼働しているか確認
3. ネットワーク接続を確認

### 依存関係のエラー
```bash
# node_modulesを削除して再インストール
rm -rf node_modules
npm install
```

---

## 📝 開発時の注意事項

### コミット前チェックリスト
- [ ] `.env.local`をコミットしていないか確認
- [ ] テストアカウントでログイン/登録が動作するか確認
- [ ] コンソールエラーがないか確認
- [ ] モバイル表示を確認

### コーディング規約
- TypeScript を使用
- コンポーネントは`PascalCase`
- ファイル名は`PascalCase.tsx`
- 関数は`camelCase`
- コメントは日本語で記述

---

## 🔄 開発ワークフロー

### 新機能追加時
1. `TASKS.md`で該当タスクを確認
2. ローカルブランチを作成（必要な場合）
3. コードを実装
4. ローカルでテスト
5. ブラウザで動作確認
6. コミット

### バグ修正時
1. 問題を再現
2. コンソールエラーを確認
3. 該当ファイルを修正
4. 動作確認
5. 同様のバグがないか確認
6. コミット

---

## 📚 参考リンク

### 使用技術ドキュメント
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [React Router v7](https://reactrouter.com/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Supabase](https://supabase.com/docs)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [React Hot Toast](https://react-hot-toast.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)

### プロジェクト管理
- [ROADMAP.md](../ROADMAP.md) - プロジェクト全体のロードマップ
- [TASKS.md](../TASKS.md) - 詳細なタスク管理
- [README.md](../README.md) - プロジェクト概要
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - データベーススキーマ設計
- [PWA_GUIDE.md](./PWA_GUIDE.md) - PWA使用ガイド
- [I18N_GUIDE.md](./I18N_GUIDE.md) - 多言語対応ガイド
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - テストガイド
- [ADMIN_GUIDE.md](./ADMIN_GUIDE.md) - 管理者機能ガイド
- [ACCESSIBILITY_GUIDE.md](./ACCESSIBILITY_GUIDE.md) - アクセシビリティガイド

---

**更新履歴**
- 2025-12-02: 初版作成（Supabase認証実装完了後）
- 2025-12-02: PWA対応情報を追加

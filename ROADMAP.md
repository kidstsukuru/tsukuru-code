# プログラミング学習プラットフォーム開発ロードマップ

最終更新: 2026-01-17

## 1. プロジェクト概要

Duolingoのようなゲーミフィケーション要素を取り入れた、小中学生向けのモバイルフレンドリーなプログラミング学習プラットフォームを構築します。子どもたちが毎日楽しくログインしたくなるような、魅力的で直感的な体験を提供することを目指します。

- **ターゲットユーザー:** 小学生〜中学生、プログラミング初心者
- **コアコンセプト:** 楽しく、継続できる学習体験

---

## 2. 実装済み機能

### ユーザー向け機能

- **ユーザー認証:** Supabaseによるメール/パスワード認証
- **学習コース:** 3層構造（コース → レベル → レッスン）でのビデオレッスン
- **学習進捗管理:** レッスン・レベル完了の追跡、XP獲得
- **連続ログイン記録:** ログインストリーク機能
- **バッジ獲得機能:** 条件達成でバッジを獲得
- **クリエイターズワールド:** 作品の投稿・閲覧・いいね・再生数カウント
- **マイ作品管理:** 作品の作成・編集・削除、サムネイル画像アップロード
- **プロフィール設定:** DiceBearアバター、表示名変更
- **レスポンシブデザイン:** モバイルファーストのUI
- **PWA対応:** オフライン動作、ホーム画面追加
- **多言語対応:** 日本語・英語

### 管理者向け機能

- **管理ダッシュボード:** 統計概要、ユーザーアクティビティ
- **コース管理:** CRUD操作、公開/非公開切り替え
- **レベル管理:** コース内レベルの作成・編集
- **レッスン管理:** リッチテキストエディタ、YouTube埋め込み
- **ユーザー管理:** ロール変更、アカウント有効/無効化
- **分析・統計:** 学習データの可視化

### 将来実装予定

- **AIメンターチャットボット:** Gemini APIによる学習サポート
- **サブスクリプション:** Stripe連携による有料プラン
- **ファミリープラン:** 保護者向け機能
- **プッシュ通知:** 学習リマインダー

---

## 3. 技術スタック

| カテゴリ | 技術 | バージョン | 説明 |
| :--- | :--- | :--- | :--- |
| **フロントエンド** | React + TypeScript | 19.x / 5.x | コンポーネントベースのUI |
| **ビルドツール** | Vite | 6.x | 高速なHMRとビルド |
| **スタイリング** | Tailwind CSS | 4.x | ユーティリティファーストCSS |
| **状態管理** | Zustand | 5.x | 軽量な状態管理 |
| **ルーティング** | React Router | 7.x | SPA ルーティング |
| **フォーム** | React Hook Form + Zod | - | バリデーション付きフォーム |
| **バックエンド** | Supabase | - | 認証、DB、ストレージ |
| **アニメーション** | Framer Motion | - | UIアニメーション |
| **PWA** | Vite PWA Plugin | - | Service Worker、オフライン対応 |
| **多言語** | react-i18next | - | 国際化 |

---

## 4. ファイル構成

```
/
├── index.html                 # メインHTML
├── index.tsx                  # エントリーポイント
├── App.tsx                    # ルーティング設定
├── types/                     # TypeScript型定義
│
├── components/                # 再利用可能コンポーネント
│   ├── common/                # Button, Input, Card, LazyImage等
│   ├── layout/                # Header, Sidebar
│   ├── admin/                 # 管理画面用コンポーネント
│   ├── creations/             # クリエイターズワールド用
│   ├── routes/                # AdminRoute等
│   └── icons.tsx              # 共有SVGアイコン
│
├── pages/                     # ページコンポーネント
│   ├── HomePage.tsx           # ランディングページ
│   ├── LoginPage.tsx          # ログイン
│   ├── RegisterPage.tsx       # 新規登録
│   ├── DashboardPage.tsx      # ダッシュボード
│   ├── CoursePage.tsx         # コース詳細
│   ├── LevelLessonsPage.tsx   # レベル内レッスン一覧
│   ├── LessonViewPage.tsx     # レッスン視聴
│   ├── CreationsPage.tsx      # クリエイターズワールド
│   ├── CreationDetailPage.tsx # 作品詳細
│   ├── MyCreationsPage.tsx    # マイ作品一覧
│   ├── CreateCreationPage.tsx # 作品投稿
│   ├── EditCreationPage.tsx   # 作品編集
│   ├── ProfilePage.tsx        # プロフィール
│   ├── SettingsPage.tsx       # 設定
│   ├── Admin*.tsx             # 管理画面各種
│   └── ...
│
├── services/                  # API通信
│   ├── supabaseService.ts     # Supabase操作
│   ├── adminService.ts        # 管理者用操作
│   └── subscriptionService.ts # サブスクリプション（準備中）
│
├── store/                     # 状態管理
│   ├── authStore.ts           # 認証状態
│   ├── sidebarStore.ts        # サイドバー状態
│   └── settingsStore.ts       # ユーザー設定
│
├── utils/                     # ユーティリティ
│   ├── avatarHelpers.ts       # DiceBearアバター
│   ├── embedHelpers.ts        # 埋め込みURL処理
│   ├── sanitizeHelpers.ts     # HTMLサニタイズ
│   └── fileValidation.ts      # ファイルバリデーション
│
├── schemas/                   # Zodスキーマ
├── i18n/                      # 多言語設定
│
├── supabase/                  # データベース
│   ├── migrations/            # マイグレーションSQL
│   └── schema_current.sql     # 現在のスキーマ
│
└── docs/                      # ドキュメント
```

---

## 5. データベース構造

### 主要テーブル

- **users** - ユーザー情報、XP、レベル、バッジ
- **courses** - コース情報
- **levels** - レベル情報（コース内の中間層）
- **lessons** - レッスン情報
- **user_progress** - レッスン進捗
- **user_level_progress** - レベル進捗
- **badge_templates** - バッジテンプレート
- **creations** - ユーザー作品
- **creation_likes** - いいね
- **plans** - サブスクリプションプラン
- **subscriptions** - ユーザーサブスクリプション

詳細は [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) を参照。

---

## 6. 開発ガイド

### 環境構築

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build
```

### 環境変数 (.env.local)

```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

詳細は [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) を参照。

---

## 7. ドキュメント一覧

| ファイル | 内容 |
| :--- | :--- |
| [DEVELOPMENT.md](docs/DEVELOPMENT.md) | 開発環境ガイド |
| [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) | データベース設計 |
| [ADMIN_GUIDE.md](docs/ADMIN_GUIDE.md) | 管理者機能 |
| [PWA_GUIDE.md](docs/PWA_GUIDE.md) | PWA使用方法 |
| [I18N_GUIDE.md](docs/I18N_GUIDE.md) | 多言語対応 |
| [ACCESSIBILITY_GUIDE.md](docs/ACCESSIBILITY_GUIDE.md) | アクセシビリティ |

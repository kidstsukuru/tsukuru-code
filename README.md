# つくるコード (Tsukuru Code)

> 小中学生向けのゲーミフィケーション型プログラミング学習プラットフォーム

毎日楽しく学べる、Duolingoスタイルのプログラミング学習体験を提供します。

## 主な機能

### ユーザー向け
- **ゲーミフィケーション**: XP獲得、レベルアップ、バッジシステム
- **3層構造の学習**: コース → レベル → レッスン
- **クリエイターズワールド**: 作品投稿・共有・いいね機能
- **マイ作品管理**: 作品の作成・編集・削除
- **プロフィール設定**: DiceBearアバター、表示名変更
- **PWA対応**: オフライン動作、ホーム画面追加
- **多言語対応**: 日本語・英語

### 管理者向け
- **管理ダッシュボード**: 統計概要、ユーザーアクティビティ
- **コース・レベル・レッスン管理**: CRUD操作、リッチテキストエディタ
- **ユーザー管理**: ロール変更、アカウント有効/無効化
- **分析・統計**: 学習データの可視化

## クイックスタート

**前提条件:** Node.js 18+

1. **依存関係のインストール**
   ```bash
   npm install
   ```

2. **環境変数の設定**

   `.env.local` を作成して以下を設定：
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

3. **開発サーバーの起動**
   ```bash
   npm run dev
   ```

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| **フロントエンド** | React 19 + TypeScript |
| **ビルドツール** | Vite 6 |
| **スタイリング** | Tailwind CSS 4 |
| **状態管理** | Zustand |
| **バックエンド** | Supabase（認証、DB、ストレージ） |
| **アニメーション** | Framer Motion |
| **PWA** | Vite PWA Plugin |
| **多言語** | react-i18next |

## プロジェクト構成

```
/
├── src/
│   ├── components/    # 再利用可能なUIコンポーネント
│   ├── pages/         # 各ページコンポーネント
│   ├── store/         # Zustand状態管理
│   ├── services/      # Supabase API通信
│   ├── i18n/          # 多言語設定
│   └── types/         # TypeScript型定義
├── supabase/
│   └── migrations/    # DBマイグレーション
└── docs/              # ドキュメント
```

## ドキュメント

- [ROADMAP.md](ROADMAP.md) - 開発計画と技術スタック
- [docs/ADMIN_GUIDE.md](docs/ADMIN_GUIDE.md) - 管理者機能ガイド
- [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) - データベース設計
- [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) - 開発環境ガイド

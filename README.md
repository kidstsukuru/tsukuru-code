# つくるコード (Tsukuru Code)

> 小中学生向けのゲーミフィケーション型プログラミング学習プラットフォーム

毎日楽しく学べる、Duolingoスタイルのプログラミング学習体験を提供します。

## ✨ 主な機能

- 🎮 ゲーミフィケーション（XP、レベル、バッジ）
- 📚 Scratchビデオレッスン
- 🏆 学習進捗トラッキング
- 🎨 クリエイターズワールド（作品共有）
- 🤖 AIメンター（有料版、準備中）

## 🚀 クイックスタート

**前提条件:** Node.js 18+

1. **依存関係のインストール**
   ```bash
   npm install
   ```

2. **環境変数の設定**

   `.env.local`にGemini APIキーを設定してください
   ```bash
   GEMINI_API_KEY=your_api_key_here
   ```

3. **開発サーバーの起動**
   ```bash
   npm run dev
   ```

   ブラウザで http://localhost:3000 にアクセス（ポートが使用中の場合は自動的に別のポートが選ばれます）

## 📖 ドキュメント

- [ROADMAP.md](ROADMAP.md) - 詳細な開発計画と技術スタック

## 🛠️ 技術スタック

- **フロントエンド:** React 19 + TypeScript
- **ビルドツール:** Vite 6
- **スタイリング:** Tailwind CSS
- **状態管理:** Zustand
- **バックエンド:** Firebase（準備中）
- **AI:** Google Gemini API（準備中）

## 📝 プロジェクト構成

```
/
├── components/    # 再利用可能なUIコンポーネント
├── pages/        # 各ページコンポーネント
├── store/        # Zustand状態管理
├── services/     # 外部API通信ロジック
└── types.ts      # TypeScript型定義
```

詳細は [ROADMAP.md](ROADMAP.md) を参照してください。

## 🎯 開発状況

現在はMVPフェーズで、以下の機能が実装済みです：
- ✅ ユーザー認証（ダミー実装）
- ✅ ダッシュボード
- ✅ コースページ
- ✅ 学習進捗管理
- ✅ バッジシステム
- ✅ クリエイターズワールド

## 🔗 リンク

- AI Studio: https://ai.studio/apps/drive/1zSNBG4szEDjFXxTSnyQRJJx7T1yp7KqN

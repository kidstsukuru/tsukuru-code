# アイコン配置ガイド

最終更新: 2025-12-02

---

## 📝 必要なファイル

以下の4つのアイコンファイルを `public/` ディレクトリに配置してください：

```
public/
├── icon-192x192.png    (192x192px) - Android用
├── icon-512x512.png    (512x512px) - Android用（高解像度）
├── apple-touch-icon.png (180x180px) - iOS用
└── favicon.ico         (32x32px) - ブラウザタブ用
```

---

## ✅ アイコン配置後の確認手順

### 1. ファイルの存在確認

```bash
ls -lh public/icon-*.png public/apple-touch-icon.png public/favicon.ico
```

### 2. 開発サーバーを再起動

```bash
# 既存のサーバーを停止
pkill -f "vite"

# サーバーを起動
npm run dev
```

### 3. ブラウザで各アイコンを確認

以下のURLにアクセスして、アイコンが表示されるか確認：

- http://localhost:3000/icon-192x192.png
- http://localhost:3000/icon-512x512.png
- http://localhost:3000/apple-touch-icon.png
- http://localhost:3000/favicon.ico

### 4. PWAインストールの確認

```bash
# 本番ビルドを作成
npm run build

# プレビューサーバーで確認
npm run preview
```

→ ブラウザのアドレスバーに「インストール」ボタン（⊕）が表示されます

### 5. インストール後の確認

- **PC（Chrome/Edge）**: アドレスバーの「インストール」アイコンをクリック
- **Android**: メニュー → 「ホーム画面に追加」
- **iOS（Safari）**: 共有ボタン → 「ホーム画面に追加」

→ ホーム画面に追加されたアイコンを確認してください

---

## 🐛 トラブルシューティング

### アイコンが表示されない

**原因**: キャッシュが残っている

**対処法**:
```bash
# 開発サーバーを完全に再起動
pkill -f "vite"
npm run dev

# または、ブラウザのキャッシュをクリア
# Chrome: Ctrl+Shift+Delete（Mac: Cmd+Shift+Delete）
```

### インストールボタンが表示されない

**原因**: HTTPS接続が必要

**対処法**:
- 本番環境（Vercel/Netlifyなど）にデプロイする
- または、`npm run preview` で確認する

### アイコンのサイズが正しくない

**原因**: 画像サイズが要件と一致していない

**対処法**:
```bash
# macOSでサイズを確認
sips -g pixelWidth -g pixelHeight public/icon-192x192.png

# または画像編集ツールでリサイズ
```

---

## 📚 参考情報

- アイコンのデザインガイドラインは [ICONS_README.md](./ICONS_README.md) を参照
- PWA全般の情報は [../docs/PWA_GUIDE.md](../docs/PWA_GUIDE.md) を参照

---

**更新履歴**
- 2025-12-02: 初版作成

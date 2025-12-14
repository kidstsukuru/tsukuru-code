# PWA アイコン生成ガイド

つくるコードのPWAアイコンを生成するためのガイドです。

## 📦 必要なアイコンサイズ

PWAとして完全に機能するには、以下のサイズのPNG画像が必要です：

- `icon-192x192.png` - Android用（必須）
- `icon-512x512.png` - Android用（必須）
- `icon-180x180.png` - iOS用（Apple Touch Icon）
- `favicon.ico` - ブラウザタブ用
- `icon-maskable-192x192.png` - マスカブルアイコン（Android）
- `icon-maskable-512x512.png` - マスカブルアイコン（Android）

## 🎨 方法1: オンラインツールを使用（最も簡単）

### A. SVGをPNGに変換（推奨）

1. **Cloudflare SVG to PNG Converter** を使用
   - URL: https://cloudconvert.com/svg-to-png
   - `public/icon.svg` をアップロード
   - サイズを設定して変換:
     - 192x192
     - 512x512
     - 180x180

2. **Favicon Generator** を使用
   - URL: https://realfavicongenerator.net/
   - `public/icon.svg` をアップロード
   - すべての必要なアイコンを一括生成
   - ダウンロードしたファイルを `public/` に配置

### B. PWA Asset Generator（推奨）

1. オンラインツール: https://progressier.com/pwa-icons-generator
2. `public/icon.svg` をアップロード
3. すべてのサイズを自動生成
4. ZIPファイルをダウンロード
5. `public/` フォルダに展開

## 🖥️ 方法2: コマンドラインツール

### sharp-cli を使用（Node.js）

```bash
# インストール
npm install -g sharp-cli

# SVGからPNG生成
npx sharp-cli -i public/icon.svg -o public/icon-192x192.png -w 192 -h 192
npx sharp-cli -i public/icon.svg -o public/icon-512x512.png -w 512 -h 512
npx sharp-cli -i public/icon.svg -o public/icon-180x180.png -w 180 -h 180
```

### ImageMagick を使用

```bash
# macOS
brew install imagemagick

# 変換
convert -background none -resize 192x192 public/icon.svg public/icon-192x192.png
convert -background none -resize 512x512 public/icon.svg public/icon-512x512.png
convert -background none -resize 180x180 public/icon.svg public/icon-180x180.png
```

## 🎯 マスカブルアイコンの作成

マスカブルアイコンは、セーフゾーン（中央80%）に重要な要素を配置する必要があります。

1. Maskable.app を使用: https://maskable.app/editor
2. `public/icon.svg` をアップロード
3. プレビューで確認しながら調整
4. 192x192 と 512x512 をエクスポート
5. `icon-maskable-192x192.png` と `icon-maskable-512x512.png` として保存

## ✅ 配置場所

すべてのアイコンを `public/` フォルダに配置：

```
public/
├── icon.svg                    # ✅ 作成済み（マスターファイル）
├── favicon.svg                 # ✅ 作成済み
├── favicon.ico                 # 🔲 作成必要
├── icon-192x192.png           # 🔲 作成必要
├── icon-512x512.png           # 🔲 作成必要
├── icon-180x180.png           # 🔲 作成必要（iOS用）
├── icon-maskable-192x192.png  # 🔲 作成必要
└── icon-maskable-512x512.png  # 🔲 作成必要
```

## 🚀 簡単な方法（推奨）

**最も簡単な方法は RealFaviconGenerator を使用することです：**

1. https://realfavicongenerator.net/ にアクセス
2. `public/icon.svg` をアップロード
3. 各プラットフォームの設定を確認
4. "Generate your Favicons and HTML code" をクリック
5. ZIPファイルをダウンロード
6. すべてのファイルを `public/` に配置
7. 生成されたHTMLコードは既に `index.html` に適用済み

## 📱 テスト方法

アイコンが正しく設定されているか確認：

1. **ローカルでテスト:**
   ```bash
   npm run build
   npm run preview
   ```

2. **PWAとしてインストール:**
   - Chrome: 右上の「インストール」アイコンをクリック
   - デスクトップにアイコンが表示されることを確認

3. **Lighthouse で確認:**
   - Chrome DevTools → Lighthouse
   - "Progressive Web App" カテゴリをチェック

## 🎨 デザインガイドライン

現在のアイコンは以下の仕様で作成されています：

- **ブランドカラー:** `#f59e0b` (Amber 500)
- **シンボル:** `<|>` コードブラケット
- **スタイル:** モダン、シンプル、子供向け
- **背景:** 角丸（border-radius: 110px / 512px = 21.5%）

アイコンを変更する場合は、`public/icon.svg` を編集してください。

## 💡 ヒント

- SVGをマスターファイルとして保管すれば、いつでも任意のサイズに変換可能
- マスカブルアイコンは、中央80%（セーフゾーン）に重要な要素を配置
- ファイルサイズは小さく保つ（各PNG < 50KB推奨）
- 高解像度ディスプレイ向けに2倍サイズを用意することも検討

## 🔗 参考リンク

- [PWA Icon Generator](https://progressier.com/pwa-icons-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [Maskable.app Editor](https://maskable.app/editor)
- [Web.dev - Add a web app manifest](https://web.dev/add-manifest/)
- [Google: Maskable Icons](https://web.dev/maskable-icon/)

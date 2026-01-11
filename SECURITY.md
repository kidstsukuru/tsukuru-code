# セキュリティガイドライン

このドキュメントは、つくるコード（Tsukuru Code）プロジェクトのセキュリティベストプラクティスをまとめたものです。

## 🔒 環境変数とシークレット管理

### クライアント側で使用可能な環境変数

以下の環境変数は `VITE_` プレフィックスが付いており、ビルド時にクライアント側のバンドルに含まれます：

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

これらは公開されても安全です。Supabase の RLS（Row Level Security）ポリシーで保護されます。

### ⚠️ 絶対にクライアント側で使用してはいけない情報

以下の情報は**バックエンド専用**です。`VITE_` プレフィックスを付けないでください：

- ❌ Service Role Key（`SUPABASE_SERVICE_ROLE_KEY`）
- ❌ データベースパスワード
- ❌ データベース接続文字列
- ❌ その他のシークレットキー

---

## 📋 次のステップ: RLS（Row Level Security）の設定

現在、管理者機能も通常の Supabase クライアントを使用しています。これは正しいアプローチですが、**Supabase側でRLSポリシーを適切に設定する必要があります**。

### 推奨される RLS ポリシー設定

Supabase ダッシュボード（SQL Editor）で以下のポリシーを設定してください：

```sql
-- ユーザーテーブル：自分のデータのみ読み取り可能
CREATE POLICY "Users can read own data"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- 管理者は全ユーザーを読み取り・更新可能
CREATE POLICY "Admins can manage all users"
ON users
FOR ALL
TO authenticated
USING (
  auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin', 'super_admin')
);

-- コース・レッスンは公開済みのみ閲覧可能
CREATE POLICY "Published courses are viewable by everyone"
ON courses FOR SELECT
USING (is_published = true OR auth.uid() IN (
  SELECT id FROM users WHERE role IN ('admin', 'super_admin')
));
```

これで RLS ポリシーでセキュリティを確保できます。

---

## 🛡️ XSS（クロスサイトスクリプティング）対策

### HTMLサニタイゼーション

このプロジェクトでは、ユーザー生成コンテンツ（レッスンの説明など）を安全に表示するため、**DOMPurify** ライブラリを使用しています。

### 使用方法

HTMLコンテンツを表示する場合は、必ず `utils/sanitizeHelpers.ts` の関数を使用してください：

```typescript
import { createSafeHTML } from '../utils/sanitizeHelpers';

// ✅ 安全な方法
<div dangerouslySetInnerHTML={createSafeHTML(htmlContent)} />

// ❌ 危険な方法（絶対に使用しないでください）
<div dangerouslySetInnerHTML={{ __html: htmlContent }} />
```

### サニタイゼーションの仕組み

`createSafeHTML()` 関数は以下の処理を行います：

1. **危険なタグの削除**: `<script>`, `<iframe>`, `<object>`, `<embed>`, `<form>` など
2. **危険な属性の削除**: `onerror`, `onclick`, `onload` などのイベントハンドラー
3. **URLプロトコルの検証**: `javascript:` などの危険なプロトコルをブロック
4. **許可されたタグのみ通過**: 安全なHTMLタグ（`<p>`, `<strong>`, `<a>` など）のみ許可

### 実装箇所

現在、以下のファイルでHTMLサニタイゼーションが実装されています：

- `pages/LessonViewPage.tsx` - レッスン説明の表示
- `pages/AdminLessonFormPage.tsx` - プレビュー表示

### ⚠️ 新しくHTMLコンテンツを表示する場合

新しい機能でHTMLコンテンツを表示する必要がある場合：

1. `dangerouslySetInnerHTML` を直接使用しない
2. 必ず `createSafeHTML()` を経由する
3. コードレビュー時にXSS脆弱性をチェックする

---

## 📁 ファイルアップロードのセキュリティ

### ファイルバリデーション

このプロジェクトでは、ファイルアップロード機能に厳格なバリデーションを実装しています。

### 実装されている保護機能

1. **ファイルタイプの検証**
   - MIMEタイプのチェック
   - ファイル拡張子のチェック（二重検証）
   - 許可される画像形式: JPEG, PNG, GIF, WebP, SVG

2. **ファイルサイズの制限**
   - アバター画像: 最大 5MB
   - サムネイル画像: 最大 10MB

3. **ファイル名のサニタイズ**
   - ユーザーIDとタイムスタンプを使用した安全なファイル名生成
   - パストラバーサル攻撃の防止

### 使用方法

ファイルアップロードを実装する場合は、`utils/fileValidation.ts` のバリデーション関数を使用してください：

```typescript
import { validateAvatarImage, validateThumbnailImage } from '../utils/fileValidation';

// アバター画像のバリデーション
const validation = validateAvatarImage(file);
if (!validation.valid) {
  throw new Error(validation.message);
}

// サムネイル画像のバリデーション
const validation = validateThumbnailImage(file);
if (!validation.valid) {
  throw new Error(validation.message);
}
```

### 現在の実装箇所

- `services/supabaseService.ts` - `uploadAvatar()` 関数

### ⚠️ 新しいファイルアップロード機能を追加する場合

1. 必ず `utils/fileValidation.ts` のバリデーション関数を使用
2. サーバー側でも検証を実装（クライアント側の検証は回避可能）
3. アップロードされたファイルは安全なストレージに保存
4. ファイル名にはユーザー入力を直接使用しない

### HTML フォームでの制限

ファイル入力要素には `accept` 属性を使用してUIレベルでも制限します：

```tsx
import { getImageAcceptString } from '../utils/fileValidation';

<input
  type="file"
  accept={getImageAcceptString()}  // "image/jpeg,image/png,..."
  onChange={handleFileChange}
/>
```

---

## 🛡️ Content Security Policy (CSP)

### CSPの実装

このアプリケーションでは、Content Security Policyを実装してXSS攻撃のリスクを軽減しています。

### 設定内容

**ファイル:** `index.html`

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https: blob:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://*.supabase.co https://api.dicebear.com;
  frame-src 'self' [許可されたドメイン];
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
">
```

### CSPポリシーの説明

- `default-src 'self'`: デフォルトで同一オリジンのリソースのみ許可
- `script-src`: インラインスクリプトを許可（Vite/React開発環境に必要）
- `img-src`: HTTPS画像、data URI、blob URLを許可
- `connect-src`: Supabase APIとDiceBear APIへの接続を許可
- `frame-src`: 許可されたドメインからのiframe埋め込みのみ許可
- `object-src 'none'`: Flash等の古いプラグインを完全にブロック
- `frame-ancestors 'none'`: このサイトをiframeに埋め込むことを禁止

⚠️ **注意**: `'unsafe-inline'` と `'unsafe-eval'` は開発環境で必要ですが、本番環境ではnonceやhashベースのCSPへの移行を検討してください。

---

## 📊 エラーログとプライバシー

### 環境別のログ出力

機密情報の漏洩を防ぐため、環境に応じてログ出力を制御しています。

### 実装内容

**ロギングユーティリティ:** `utils/logger.ts`

```typescript
import { logError, logWarn, logInfo } from '../utils/logger';

// 開発環境でのみ詳細なエラーログを出力
logError('An error occurred', error);

// 本番環境ではユーザーフレンドリーなメッセージのみ表示
```

### ログポリシー

| 環境 | console.error | console.log | 詳細情報 |
|------|--------------|-------------|---------|
| **開発環境** | ✅ 出力 | ✅ 出力 | ✅ スタックトレース含む |
| **本番環境** | ❌ 抑制 | ❌ 抑制 | ❌ 一般的なメッセージのみ |

### 機密情報のサニタイズ

ログに記録される前に、以下の情報は自動的に `[REDACTED]` に置き換えられます：

- パスワード
- トークン
- APIキー
- Cookie
- セッション情報

---

## ⏱️ セッションタイムアウト

### 自動ログアウト機能

セキュリティを強化するため、非アクティブなセッションを自動的にログアウトする機能を提供しています。

### 実装方法

**ユーティリティ:** `utils/sessionTimeout.ts`

```typescript
import { initSessionTimeout, cleanupSessionTimeout } from '../utils/sessionTimeout';

// セッションタイムアウトを初期化
initSessionTimeout(
  () => {
    // 30分非アクティブでログアウト
    logout();
    toast.info('セッションがタイムアウトしました');
  },
  () => {
    // 5分前に警告表示
    toast.warning('まもなくセッションがタイムアウトします');
  }
);

// クリーンアップ
cleanupSessionTimeout();
```

### タイムアウト設定

- **タイムアウト時間**: 30分（非アクティブ状態）
- **警告表示**: タイムアウトの5分前
- **監視イベント**: マウス移動、キー入力、スクロール、タッチ操作

### 使用方法

App.tsx等のルートコンポーネントで初期化してください：

```tsx
useEffect(() => {
  if (isAuthenticated) {
    initSessionTimeout(handleTimeout, handleWarning);
  }

  return () => {
    cleanupSessionTimeout();
  };
}, [isAuthenticated]);
```

---

## 📄 セキュリティチェックリスト

開発時には以下を確認してください：

### 環境変数とシークレット管理
- [ ] 環境変数に機密情報（Service Role Key）を含めていない
- [ ] `VITE_` プレフィックスの環境変数は公開されても安全な情報のみ
- [ ] `.env.local` が `.gitignore` に含まれている

### XSS対策
- [ ] `dangerouslySetInnerHTML` を使用する場合は `createSafeHTML()` を経由
- [ ] ユーザー入力は適切にバリデーション・サニタイズされている
- [ ] TipTap等のリッチテキストエディタの出力を信頼する前にサニタイズ

### ファイルアップロード
- [ ] ファイルアップロードには型とサイズの制限がある
- [ ] ファイル名にユーザー入力を直接使用していない
- [ ] アップロードされたファイルは安全なストレージに保存

### 認証・認可
- [ ] Supabase RLS ポリシーが適切に設定されている
- [ ] 管理者機能にはクライアント側とサーバー側の両方で権限チェック
- [ ] セッションタイムアウトが適切に実装されている

### セキュリティヘッダー
- [ ] Content Security Policy (CSP) が設定されている
- [ ] CSPポリシーが最小権限の原則に従っている

### エラー処理
- [ ] 本番環境で機密情報を含むエラーメッセージが表示されない
- [ ] エラーログは `utils/logger.ts` を使用して環境別に制御
- [ ] 本番環境のエラーは監視サービスに送信（推奨）

### コードレビュー
- [ ] 新しいファイルアップロード機能にはバリデーションが実装されている
- [ ] 外部APIへの接続は信頼できるドメインのみ
- [ ] iframe埋め込みはホワイトリストで制限されている

---

## 🔍 セキュリティ問題の報告

セキュリティ上の問題を発見した場合は、公開イシューではなく、プロジェクトメンテナーに直接連絡してください。

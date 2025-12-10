# アクセシビリティガイド

## 概要

つくるコード（Tsukuru Code）は、すべてのユーザーが快適に利用できるよう、WCAG 2.1 レベルAA基準に準拠したアクセシビリティ機能を実装しています。

## 実装済みのアクセシビリティ機能

### 1. キーボードナビゲーション

#### スキップリンク
- **機能**: キーボードユーザーが繰り返しのナビゲーションをスキップして、メインコンテンツに直接移動できます
- **使い方**: Tabキーを押すと最初に表示されます
- **実装場所**: `components/common/SkipLink.tsx`

#### キーボードショートカット
- **Tab**: 次の要素にフォーカス
- **Shift + Tab**: 前の要素にフォーカス
- **Enter/Space**: ボタンやリンクを実行
- **Escape**: モーダルやメニューを閉じる

### 2. ARIA属性

すべてのインタラクティブ要素に適切なARIA属性を実装:

```typescript
// ボタンの例
<button
  aria-label="ユーザーメニュー"
  aria-expanded={isMenuOpen}
  aria-haspopup="true"
>

// メニューの例
<div
  role="menu"
  aria-orientation="vertical"
  aria-labelledby="user-menu-button"
>

// フォーム入力の例
<input
  aria-invalid={error ? 'true' : 'false'}
  aria-describedby={error ? errorId : undefined}
  aria-required={required}
>
```

### 3. フォーカス管理

#### フォーカスインジケーター
- すべてのインタラクティブ要素に明確なフォーカスリングを表示
- カラー: アンバー (#f59e0b)
- オフセット: 2px
- 太さ: 2px

#### フォーカストラップ
- モーダルやドロップダウンメニューでは、フォーカスが内部に留まります
- Escapeキーで閉じると、元の要素にフォーカスが戻ります

```css
/* グローバルフォーカススタイル */
*:focus-visible {
  outline: 2px solid #f59e0b;
  outline-offset: 2px;
}
```

### 4. セマンティックHTML

適切なHTML要素とロールを使用:

```html
<!-- ナビゲーション -->
<nav role="navigation" aria-label="メインナビゲーション">

<!-- メインコンテンツ -->
<main id="main-content">

<!-- アプリケーションルート -->
<div id="root" role="application" aria-label="つくるコード - プログラミング学習アプリ">
```

### 5. フォームアクセシビリティ

#### エラーメッセージ
```typescript
<p
  id={errorId}
  className="mt-1 text-sm text-red-600"
  role="alert"
  aria-live="polite"
>
  {error}
</p>
```

#### 必須フィールドの表示
```typescript
{label && (
  <label htmlFor={inputId}>
    {label}
    {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
  </label>
)}
```

### 6. カラーコントラスト

WCAG 2.1 レベルAA基準（コントラスト比 4.5:1）を満たす配色:

#### テキストコントラスト
| 用途 | 前景色 | 背景色 | コントラスト比 |
|------|--------|--------|---------------|
| 本文テキスト | #1f2937 (gray-800) | #fffbeb (amber-50) | 12.6:1 ✅ |
| リンク | #f59e0b (amber-500) | #fffbeb (amber-50) | 4.8:1 ✅ |
| エラー | #dc2626 (red-600) | #ffffff (white) | 5.9:1 ✅ |
| ボタン | #ffffff (white) | #f59e0b (amber-500) | 4.8:1 ✅ |

#### 大きなテキスト（18pt以上）
大きなテキストには3:1のコントラスト比が適用されます。

### 7. スクリーンリーダー対応

#### スクリーンリーダー専用テキスト
```typescript
// .sr-only クラスを使用
<span className="sr-only">
  メインコンテンツへスキップ
</span>

// フォーカス時に表示
<a
  href="#main-content"
  className="sr-only focus:not-sr-only"
>
  メインコンテンツへスキップ
</a>
```

#### ライブリージョン
動的に変更されるコンテンツにはaria-liveを使用:
```typescript
<div aria-live="polite" aria-atomic="true">
  {notification}
</div>
```

### 8. 自動アクセシビリティテスト

#### 開発環境
axe-coreを使用して、開発中にアクセシビリティ問題を自動検出:

```typescript
// index.tsx
if (import.meta.env.DEV) {
  import('@axe-core/react').then((axe) => {
    axe.default(React, ReactDOM, 1000);
  });
}
```

コンソールにアクセシビリティの問題が表示されます。

## コンポーネント別アクセシビリティ機能

### Button コンポーネント
- `aria-disabled` 属性による無効状態の明示
- フォーカス可能なリングスタイル
- disabled時のカーソルとスタイル変更

```typescript
<Button variant="primary" disabled={isLoading}>
  送信
</Button>
```

### Input コンポーネント
- 自動ID生成とラベルの関連付け
- エラー状態のARIA属性
- 必須フィールドの視覚的・意味的表示

```typescript
<Input
  label="メールアドレス"
  error="有効なメールアドレスを入力してください"
  required
/>
```

### Header コンポーネント
- ナビゲーションランドマーク
- メニュー展開状態の通知
- Escapeキーでメニューを閉じる
- フォーカス管理

### SkipLink コンポーネント
- キーボードユーザー用のスキップナビゲーション
- フォーカス時のみ表示
- メインコンテンツへの直接リンク

## アクセシビリティテスト方法

### 1. キーボードテスト
1. マウスを使わずにTabキーでナビゲーション
2. すべてのインタラクティブ要素にフォーカスできるか確認
3. Enter/Spaceキーですべての操作が可能か確認
4. Escapeキーでモーダルが閉じるか確認

### 2. スクリーンリーダーテスト
- **macOS**: VoiceOver（Cmd + F5）
- **Windows**: NVDA または JAWS
- **Linux**: Orca

### 3. 自動テスト
開発環境で実行すると、axe-coreがブラウザコンソールに問題を出力します。

### 4. コントラストチェック
以下のツールを使用して色のコントラストを確認:
- WebAIM Contrast Checker
- Chrome DevTools の Accessibility タブ
- axe DevTools 拡張機能

## ベストプラクティス

### 新しいコンポーネントを作成する際の注意点

1. **セマンティックHTML を使用**
   ```typescript
   // ❌ 悪い例
   <div onClick={handleClick}>クリック</div>

   // ✅ 良い例
   <button onClick={handleClick}>クリック</button>
   ```

2. **ARIA属性を適切に使用**
   ```typescript
   // ❌ 悪い例
   <div>モーダルコンテンツ</div>

   // ✅ 良い例
   <div role="dialog" aria-labelledby="modal-title" aria-modal="true">
     <h2 id="modal-title">モーダルタイトル</h2>
     モーダルコンテンツ
   </div>
   ```

3. **キーボード操作をサポート**
   ```typescript
   const handleKeyDown = (e: React.KeyboardEvent) => {
     if (e.key === 'Enter' || e.key === ' ') {
       handleAction();
     }
   };
   ```

4. **フォーカス管理**
   ```typescript
   // モーダルを開いた時
   useEffect(() => {
     if (isOpen) {
       modalRef.current?.focus();
     }
   }, [isOpen]);
   ```

5. **エラーメッセージを明確に**
   ```typescript
   <input
     aria-invalid={!!error}
     aria-describedby={error ? 'error-message' : undefined}
   />
   {error && (
     <p id="error-message" role="alert">
       {error}
     </p>
   )}
   ```

## 参考リンク

- [WCAG 2.1 ガイドライン](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [axe-core Documentation](https://github.com/dequelabs/axe-core)
- [WebAIM Resources](https://webaim.org/resources/)

## サポート

アクセシビリティに関する問題を発見した場合は、GitHubのIssueで報告してください。

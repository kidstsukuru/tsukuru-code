# 国際化（i18n）ガイド

最終更新: 2025-12-02

---

## 📋 概要

**つくるコード**は、react-i18nextを使用して多言語対応しています。現在、日本語と英語をサポートしています。

---

## 🌍 サポート言語

- 🇯🇵 **日本語 (ja)** - デフォルト言語
- 🇺🇸 **英語 (en)**

---

## 🚀 使い方

### 1. コンポーネントで翻訳を使用

```typescript
import { useTranslation } from 'react-i18next';

const MyComponent: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('home.title')}</h1>
      <p>{t('home.description')}</p>
    </div>
  );
};
```

### 2. 変数を含む翻訳

```typescript
// 翻訳ファイル (ja.json)
{
  "dashboard": {
    "welcome": "{{name}}さん、おかえりなさい！"
  }
}

// コンポーネント
<p>{t('dashboard.welcome', { name: user.name })}</p>
// 出力: "太郎さん、おかえりなさい！"
```

### 3. 言語の切り替え

```typescript
import { useTranslation } from 'react-i18next';

const { i18n } = useTranslation();

// 日本語に切り替え
i18n.changeLanguage('ja');

// 英語に切り替え
i18n.changeLanguage('en');

// 現在の言語を取得
console.log(i18n.language); // 'ja' または 'en'
```

---

## 📁 ファイル構成

```
src/
└── i18n/
    ├── config.ts           # i18n設定ファイル
    └── locales/
        ├── ja.json         # 日本語翻訳
        └── en.json         # 英語翻訳
```

---

## 📝 翻訳キーの構造

翻訳ファイルは階層構造で整理されています：

```json
{
  "common": {
    "login": "ログイン",
    "logout": "ログアウト"
  },
  "home": {
    "title": "ゲームみたいに楽しく学ぼう！",
    "description": "..."
  },
  "dashboard": {
    "welcome": "{{name}}さん、おかえりなさい！"
  }
}
```

### 翻訳キーのカテゴリ

- **common** - ボタン、ラベルなど共通の要素
- **home** - ホームページのテキスト
- **auth** - 認証関連（ログイン、登録）
- **validation** - バリデーションエラーメッセージ
- **dashboard** - ダッシュボード画面
- **course** - コース関連
- **creations** - クリエイターズワールド
- **badges** - バッジ名と説明
- **errors** - エラーメッセージ

---

## 🎨 言語切り替えコンポーネント

アプリには言語切り替えボタンが組み込まれています：

```typescript
import LanguageSwitcher from './components/common/LanguageSwitcher';

// Headerコンポーネント内で使用
<LanguageSwitcher />
```

### 表示例

```
[ 🇯🇵 JA ] [ 🇺🇸 EN ]
```

現在選択されている言語はオレンジ色でハイライトされます。

---

## 🔧 設定

### i18n設定 (src/i18n/config.ts)

```typescript
i18n
  .use(LanguageDetector) // ブラウザの言語を自動検出
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ja', // デフォルト言語
    lng: 'ja',         // 初期言語
    detection: {
      order: ['localStorage', 'navigator'], // 検出の優先順位
      caches: ['localStorage'],             // localStorageに保存
    },
  });
```

### 言語検出の優先順位

1. **localStorage** - ユーザーが選択した言語（保存済み）
2. **navigator** - ブラウザの言語設定

---

## ✍️ 新しい翻訳の追加

### 手順

1. **翻訳ファイルに追加**

```json
// src/i18n/locales/ja.json
{
  "newSection": {
    "newKey": "新しいテキスト"
  }
}

// src/i18n/locales/en.json
{
  "newSection": {
    "newKey": "New Text"
  }
}
```

2. **コンポーネントで使用**

```typescript
const { t } = useTranslation();
<p>{t('newSection.newKey')}</p>
```

---

## 🌐 新しい言語の追加

### 手順

1. **翻訳ファイルを作成**

```bash
# フランス語の例
touch src/i18n/locales/fr.json
```

2. **config.tsに追加**

```typescript
import translationFR from './locales/fr.json';

const resources = {
  ja: { translation: translationJA },
  en: { translation: translationEN },
  fr: { translation: translationFR }, // 追加
};
```

3. **LanguageSwitcherに追加**

```typescript
const languages = [
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' }, // 追加
];
```

---

## 🎯 ベストプラクティス

### 1. 翻訳キーの命名規則

✅ **良い例**
```typescript
t('auth.loginSuccess')     // カテゴリ.アクション
t('validation.required.email') // カテゴリ.タイプ.フィールド
```

❌ **悪い例**
```typescript
t('loginSuccessMessage')   // 構造が不明確
t('error1')                // 意味が分からない
```

### 2. 変数の使用

```typescript
// ✅ 良い例
t('dashboard.welcome', { name: user.name })

// ❌ 悪い例
`${t('dashboard.welcome')} ${user.name}` // 言語によって語順が違う可能性
```

### 3. 複数形の扱い

```typescript
// 翻訳ファイル
{
  "course": {
    "lessons_one": "{{count}}個のレッスン",
    "lessons_other": "{{count}}個のレッスン"
  }
}

// 使用
t('course.lessons', { count: lessonCount })
```

### 4. デフォルト値の設定

```typescript
// キーが見つからない場合のデフォルト値
t('unknown.key', 'デフォルトテキスト')
```

---

## 📊 実装状況

### 完了済み ✅

- [x] i18n環境構築
- [x] 日本語翻訳ファイル
- [x] 英語翻訳ファイル
- [x] LanguageSwitcherコンポーネント
- [x] Headerコンポーネントの翻訳対応
- [x] ブラウザ言語の自動検出
- [x] localStorageへの言語設定保存

### 今後の対応 📝

- [ ] HomePageの翻訳対応
- [ ] LoginPageの翻訳対応
- [ ] RegisterPageの翻訳対応
- [ ] DashboardPageの翻訳対応
- [ ] CoursePageの翻訳対応
- [ ] CreationsPageの翻訳対応
- [ ] バリデーションスキーマの翻訳対応
- [ ] エラーメッセージの翻訳対応

---

## 🐛 トラブルシューティング

### 翻訳が表示されない

**原因**: 翻訳キーが間違っている、または翻訳ファイルにキーが存在しない

**対処法**:
```typescript
// デバッグモードを有効化
i18n.init({
  debug: true, // コンソールにログが表示される
  ...
});
```

### 言語が切り替わらない

**原因**: コンポーネントが再レンダリングされていない

**対処法**: `useTranslation`フックを使用していることを確認

```typescript
// ✅ 正しい
const { t } = useTranslation();

// ❌ 間違い
import i18n from './i18n/config';
const text = i18n.t('key'); // コンポーネントが再レンダリングされない
```

### localStorageがクリアされる

**原因**: ブラウザの設定またはプライベートモード

**対処法**: 通常モードでアクセスするか、検出順序を変更

```typescript
detection: {
  order: ['navigator', 'localStorage'], // navigatorを優先
}
```

---

## 📚 参考リンク

- [react-i18next 公式ドキュメント](https://react.i18next.com/)
- [i18next 公式ドキュメント](https://www.i18next.com/)
- [言語コード一覧 (ISO 639-1)](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)

---

**更新履歴**
- 2025-12-02: 初版作成（日本語・英語対応完了）

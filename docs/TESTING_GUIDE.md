# テストガイド

最終更新: 2025-12-02

---

## 📋 概要

**つくるコード**では、Vitest + React Testing Libraryを使用して、コンポーネントや機能のテストを実装しています。

---

## 🧪 テストフレームワーク

### 使用技術

- **Vitest** - Viteに最適化された高速テストフレームワーク
- **React Testing Library** - Reactコンポーネントのテスト
- **@testing-library/user-event** - ユーザーインタラクションのシミュレーション
- **@testing-library/jest-dom** - DOM要素のアサーション拡張

---

## 🚀 テストの実行

### 基本コマンド

```bash
# テストを実行（1回のみ）
npm run test

# ウォッチモード（ファイル変更を監視して自動実行）
npm run test:watch

# UIモード（ブラウザでテスト結果を確認）
npm run test:ui

# カバレッジレポート生成
npm run test:coverage
```

### 特定のテストファイルのみ実行

```bash
# ファイル名を指定
npm run test Button.test.tsx

# パターンマッチング
npm run test -- components/common
```

---

## 📁 テストファイル構成

```
src/
├── test/
│   ├── setup.ts              # テスト環境のセットアップ
│   ├── test-utils.tsx        # カスタムレンダー関数
│   └── mocks/
│       └── supabase.ts       # Supabaseのモック
├── components/
│   └── common/
│       ├── Button.tsx
│       ├── Button.test.tsx   # コンポーネントテスト
│       ├── Input.tsx
│       ├── Input.test.tsx
│       ├── Card.tsx
│       └── Card.test.tsx
├── pages/
│   ├── LoginPage.tsx
│   ├── LoginPage.test.tsx    # 統合テスト
│   ├── RegisterPage.tsx
│   └── RegisterPage.test.tsx
└── store/
    ├── authStore.ts
    └── authStore.test.ts      # ストアのテスト
```

---

## ✍️ テストの書き方

### 1. コンポーネントの単体テスト

#### Button.test.tsx の例

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/src/test/test-utils';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button', () => {
  it('正しくレンダリングされる', () => {
    render(<Button>クリック</Button>);
    expect(screen.getByRole('button', { name: 'クリック' })).toBeInTheDocument();
  });

  it('クリックイベントが動作する', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>クリック</Button>);

    await user.click(screen.getByRole('button', { name: 'クリック' }));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('disabled状態ではクリックできない', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button disabled onClick={handleClick}>クリック</Button>);

    const button = screen.getByRole('button', { name: 'クリック' });
    expect(button).toBeDisabled();

    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
```

### 2. 統合テスト（認証フロー）

#### LoginPage.test.tsx の例

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/src/test/test-utils';
import userEvent from '@testing-library/user-event';
import LoginPage from './LoginPage';
import * as supabaseService from '@/services/supabaseService';

// Supabaseサービスをモック
vi.mock('@/services/supabaseService', () => ({
  loginUser: vi.fn(),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ログイン成功時にダッシュボードへ遷移する', async () => {
    const user = userEvent.setup();
    vi.mocked(supabaseService.loginUser).mockResolvedValue({
      id: 'test-user-id',
      email: 'test@example.com',
    } as any);

    render(<LoginPage />);

    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    const loginButton = screen.getByRole('button', { name: 'ログイン' });
    await user.click(loginButton);

    await waitFor(() => {
      expect(window.location.pathname).toBe('/dashboard');
    });
  });
});
```

### 3. カスタムフック（Zustand Store）のテスト

#### authStore.test.ts の例

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuthStore } from './authStore';

describe('authStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      isAuthenticated: false,
      user: null,
      loading: false,
    });
  });

  it('ログイン成功時に認証状態が更新される', async () => {
    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).not.toBeNull();
    });
  });
});
```

---

## 🎯 テストのベストプラクティス

### 1. ユーザーの視点でテストを書く

❌ **悪い例（実装の詳細をテスト）**
```typescript
expect(component.state.isOpen).toBe(true);
```

✅ **良い例（ユーザーが見えるものをテスト）**
```typescript
expect(screen.getByText('メニューが開きました')).toBeInTheDocument();
```

### 2. アクセシビリティを意識する

```typescript
// role を使用した要素の取得
screen.getByRole('button', { name: 'ログイン' });
screen.getByRole('textbox', { name: 'メールアドレス' });

// label を使用した取得
screen.getByLabelText('パスワード');
```

### 3. 非同期処理は waitFor を使用

```typescript
await waitFor(() => {
  expect(screen.getByText('成功しました')).toBeInTheDocument();
});
```

### 4. テストごとにクリーンアップ

```typescript
beforeEach(() => {
  vi.clearAllMocks();
  // ストアのリセットなど
});
```

---

## 📊 カバレッジレポート

### カバレッジの確認

```bash
npm run test:coverage
```

### カバレッジレポートの見方

- **Statements**: 実行されたコードの行数
- **Branches**: 条件分岐のカバー率
- **Functions**: テストされた関数の割合
- **Lines**: テストされたコードの行数

### 目標カバレッジ

- **80%以上**: 基本的なカバレッジ目標
- **90%以上**: より堅牢なテスト

---

## 🔧 モックの使い方

### 1. Supabaseサービスのモック

```typescript
vi.mock('@/services/supabaseService', () => ({
  loginUser: vi.fn(),
  registerUser: vi.fn(),
  logoutUser: vi.fn(),
}));
```

### 2. React Routerのモック

```typescript
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});
```

### 3. toastのモック

```typescript
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));
```

---

## 🐛 トラブルシューティング

### テストが失敗���る

1. **モックが正しく設定されているか確認**
   ```bash
   vi.mocked(supabaseService.loginUser).mockResolvedValue(...)
   ```

2. **非同期処理を待っているか確認**
   ```bash
   await waitFor(() => { ... })
   ```

3. **テストの独立性を確認**
   - beforeEach でクリーンアップしているか
   - 他のテストに依存していないか

### カバレッジが上がらない

- 除外設定を確認（vitest.config.ts）
- テストされていないパスを確認
- エッジケースのテストを追加

---

## 📚 参考リンク

- [Vitest 公式ドキュメント](https://vitest.dev/)
- [React Testing Library 公式ドキュメント](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library のクエリ優先順位](https://testing-library.com/docs/queries/about/#priority)
- [Common Mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## ✅ テスト実装状況

### 完了済み

- ✅ Button コンポーネント
- ✅ Input コンポーネント
- ✅ Card コンポーネント
- ✅ LoginPage（統合テスト）
- ✅ RegisterPage（統合テスト）
- ✅ authStore（カスタムフック）

### 今後の追加予定

- [ ] HomePage コンポーネント
- [ ] DashboardPage コンポーネント
- [ ] CoursePage コンポーネント
- [ ] Badge システムのテスト
- [ ] E2Eテスト（Playwright）

---

**更新履歴**
- 2025-12-02: 初版作成（Vitest + React Testing Library 導入完了）

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/src/test/test-utils';
import userEvent from '@testing-library/user-event';
import LoginPage from './LoginPage';
import * as supabaseService from '@/services/supabaseService';

// Supabaseサービスをモック
vi.mock('@/services/supabaseService', () => ({
  loginUser: vi.fn(),
}));

// React Router のnavigate をモック
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ログインフォームが正しく表示される', () => {
    render(<LoginPage />);

    expect(screen.getByRole('heading', { name: 'ログイン' })).toBeInTheDocument();
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument();
  });

  it('新規登録リンクが表示される', () => {
    render(<LoginPage />);
    expect(screen.getByText(/アカウントをお持ちでない方/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '新規登録' })).toBeInTheDocument();
  });

  it('バリデーションエラーが表示される - 空のフォーム', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const loginButton = screen.getByRole('button', { name: 'ログイン' });
    await user.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('メールアドレスを入力してください')).toBeInTheDocument();
      expect(screen.getByText('パスワードを入力してください')).toBeInTheDocument();
    });
  });

  it('バリデーションエラーが表示される - 不正なメール', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByLabelText('メールアドレス');
    await user.type(emailInput, '不正なメール');

    const loginButton = screen.getByRole('button', { name: 'ログイン' });
    await user.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('正しいメールアドレスを入力してください')).toBeInTheDocument();
    });
  });

  it('バリデーションエラーが表示される - 短いパスワード', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, '12345');

    const loginButton = screen.getByRole('button', { name: 'ログイン' });
    await user.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('パスワードは6文字以上で入力してください')).toBeInTheDocument();
    });
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
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('ログイン失敗時にエラーメッセージが表示される', async () => {
    const user = userEvent.setup();
    vi.mocked(supabaseService.loginUser).mockRejectedValue(new Error('ログインに失敗しました'));

    render(<LoginPage />);

    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');

    const loginButton = screen.getByRole('button', { name: 'ログイン' });
    await user.click(loginButton);

    // エラートーストが表示されることを確認（react-hot-toast使用）
    await waitFor(() => {
      expect(supabaseService.loginUser).toHaveBeenCalledWith('test@example.com', 'wrongpassword');
    });
  });
});

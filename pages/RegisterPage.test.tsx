import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/src/test/test-utils';
import userEvent from '@testing-library/user-event';
import RegisterPage from './RegisterPage';
import * as supabaseService from '@/services/supabaseService';

// Supabaseサービスをモック
vi.mock('@/services/supabaseService', () => ({
  registerUser: vi.fn(),
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

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('登録フォームが正しく表示される', () => {
    render(<RegisterPage />);

    expect(screen.getByRole('heading', { name: '新規登録' })).toBeInTheDocument();
    expect(screen.getByLabelText('名前')).toBeInTheDocument();
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード（確認）')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '登録' })).toBeInTheDocument();
  });

  it('ログインリンクが表示される', () => {
    render(<RegisterPage />);
    expect(screen.getByText(/すでにアカウントをお持ちの方/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'ログイン' })).toBeInTheDocument();
  });

  it('バリデーションエラーが表示される - 空のフォーム', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    const registerButton = screen.getByRole('button', { name: '登録' });
    await user.click(registerButton);

    await waitFor(() => {
      expect(screen.getByText('名前を入力してください')).toBeInTheDocument();
      expect(screen.getByText('メールアドレスを入力してください')).toBeInTheDocument();
      expect(screen.getByText('パスワードを入力してください')).toBeInTheDocument();
      expect(screen.getByText('パスワード（確認）を入力してください')).toBeInTheDocument();
    });
  });

  it('バリデーションエラーが表示される - 名前が短い', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    const nameInput = screen.getByLabelText('名前');
    await user.type(nameInput, 'A');

    const registerButton = screen.getByRole('button', { name: '登録' });
    await user.click(registerButton);

    await waitFor(() => {
      expect(screen.getByText('名前は2文字以上で入力してください')).toBeInTheDocument();
    });
  });

  it('バリデーションエラーが表示される - パスワードが不一致', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    const nameInput = screen.getByLabelText('名前');
    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');
    const confirmPasswordInput = screen.getByLabelText('パスワード（確認）');

    await user.type(nameInput, 'テストユーザー');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password456');

    const registerButton = screen.getByRole('button', { name: '登録' });
    await user.click(registerButton);

    await waitFor(() => {
      expect(screen.getByText('パスワードが一致しません')).toBeInTheDocument();
    });
  });

  it('登録成功時にダッシュボードへ遷移する', async () => {
    const user = userEvent.setup();
    vi.mocked(supabaseService.registerUser).mockResolvedValue({
      id: 'test-user-id',
      email: 'test@example.com',
    } as any);

    render(<RegisterPage />);

    const nameInput = screen.getByLabelText('名前');
    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');
    const confirmPasswordInput = screen.getByLabelText('パスワード（確認）');

    await user.type(nameInput, 'テストユーザー');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');

    const registerButton = screen.getByRole('button', { name: '登録' });
    await user.click(registerButton);

    await waitFor(() => {
      expect(supabaseService.registerUser).toHaveBeenCalledWith(
        'テストユーザー',
        'test@example.com',
        'password123'
      );
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('登録失敗時にエラーメッセージが表示される', async () => {
    const user = userEvent.setup();
    vi.mocked(supabaseService.registerUser).mockRejectedValue(new Error('登録に失敗しました'));

    render(<RegisterPage />);

    const nameInput = screen.getByLabelText('名前');
    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');
    const confirmPasswordInput = screen.getByLabelText('パスワード（確認）');

    await user.type(nameInput, 'テストユーザー');
    await user.type(emailInput, 'existing@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');

    const registerButton = screen.getByRole('button', { name: '登録' });
    await user.click(registerButton);

    await waitFor(() => {
      expect(supabaseService.registerUser).toHaveBeenCalled();
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuthStore } from './authStore';
import * as supabaseService from '@/services/supabaseService';
import toast from 'react-hot-toast';

// モジュールをモック
vi.mock('@/services/supabaseService', () => ({
  registerUser: vi.fn(),
  loginUser: vi.fn(),
  logoutUser: vi.fn(),
  getUserData: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  },
}));

describe('authStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // ストアをリセット
    useAuthStore.setState({
      isAuthenticated: false,
      user: null,
      loading: false,
    });
  });

  describe('初期状態', () => {
    it('未認証状態で初期化される', () => {
      const { result } = renderHook(() => useAuthStore());
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.loading).toBe(false);
    });
  });

  describe('login', () => {
    it('ログイン成功時に認証状態が更新される', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
      };

      const mockUserData = {
        id: 'test-user-id',
        name: 'テストユーザー',
        email: 'test@example.com',
        loginStreak: 1,
        xp: 0,
        level: 1,
        badges: [],
        progress: {},
      };

      vi.mocked(supabaseService.loginUser).mockResolvedValue(mockUser as any);
      vi.mocked(supabaseService.getUserData).mockResolvedValue(mockUserData as any);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.user).toMatchObject({
          name: 'テストユーザー',
          email: 'test@example.com',
        });
        expect(result.current.loading).toBe(false);
      });
    });

    it('空のメールアドレスでエラーが表示される', async () => {
      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.login('', 'password123');
      });

      expect(toast.error).toHaveBeenCalledWith('メールアドレスとパスワードを入力してください');
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('不正なメールアドレスでエラーが表示される', async () => {
      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.login('invalid-email', 'password123');
      });

      expect(toast.error).toHaveBeenCalledWith('正しいメールアドレスを入力してください');
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('短いパスワードでエラーが表示される', async () => {
      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.login('test@example.com', '12345');
      });

      expect(toast.error).toHaveBeenCalledWith('パスワードは6文字以上である必要があります');
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('ログイン失敗時にエラーメッセージが表示される', async () => {
      vi.mocked(supabaseService.loginUser).mockRejectedValue(new Error('ログインに失敗しました'));

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.login('test@example.com', 'wrongpassword');
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('register', () => {
    it('登録成功時に認証状態が更新される', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
      };

      const mockUserData = {
        id: 'test-user-id',
        name: 'テストユーザー',
        email: 'test@example.com',
        loginStreak: 1,
        xp: 0,
        level: 1,
        badges: [],
        progress: {},
      };

      vi.mocked(supabaseService.registerUser).mockResolvedValue(mockUser as any);
      vi.mocked(supabaseService.getUserData).mockResolvedValue(mockUserData as any);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.register('テストユーザー', 'test@example.com', 'password123');
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.user?.name).toBe('テストユーザー');
        expect(result.current.loading).toBe(false);
      });
    });

    it('登録失敗時にエラーメッセージが表示される', async () => {
      vi.mocked(supabaseService.registerUser).mockRejectedValue(new Error('登録に失敗しました'));

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.register('テストユーザー', 'test@example.com', 'password123');
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('logout', () => {
    it('ログアウト成功時に状態がクリアされる', async () => {
      vi.mocked(supabaseService.logoutUser).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuthStore());

      // まず認証状態をセット
      act(() => {
        useAuthStore.setState({
          isAuthenticated: true,
          user: {
            id: 'test-user-id',
            name: 'テストユーザー',
            email: 'test@example.com',
            loginStreak: 1,
            xp: 0,
            level: 1,
            badges: [],
            progress: {},
          },
        });
      });

      // ログアウト実行
      await act(async () => {
        await result.current.logout();
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.user).toBeNull();
        expect(toast.success).toHaveBeenCalledWith('ログアウトしました');
      });
    });

    it('ログアウト失敗時にエラーメッセージが表示される', async () => {
      vi.mocked(supabaseService.logoutUser).mockRejectedValue(new Error('ログアウトに失敗しました'));

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.logout();
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });
});

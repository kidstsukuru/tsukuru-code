import { vi } from 'vitest';

// モックユーザーデータ
export const mockUser = {
  id: 'test-user-id-123',
  email: 'test@example.com',
  user_metadata: {
    name: 'テストユーザー',
  },
  created_at: new Date().toISOString(),
};

export const mockUserData = {
  id: 'test-user-id-123',
  name: 'テストユーザー',
  email: 'test@example.com',
  login_streak: 1,
  xp: 0,
  level: 1,
  badges: [],
  progress: {},
  created_at: new Date().toISOString(),
};

// Supabaseクライアントのモック
export const createMockSupabaseClient = () => ({
  auth: {
    signUp: vi.fn().mockResolvedValue({
      data: { user: mockUser, session: null },
      error: null,
    }),
    signInWithPassword: vi.fn().mockResolvedValue({
      data: { user: mockUser, session: { access_token: 'mock-token' } },
      error: null,
    }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: vi.fn((callback) => {
      callback('SIGNED_IN', { user: mockUser });
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    }),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: mockUserData, error: null }),
  })),
});

// Supabaseサービスのモック
export const mockSupabaseService = {
  registerUser: vi.fn().mockResolvedValue(mockUser),
  loginUser: vi.fn().mockResolvedValue(mockUser),
  logoutUser: vi.fn().mockResolvedValue(undefined),
  getUserData: vi.fn().mockResolvedValue(mockUserData),
  onAuthStateChange: vi.fn(),
};

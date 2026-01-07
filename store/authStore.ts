import { create } from 'zustand';
import toast from 'react-hot-toast';
import { User, AppBadge } from '../types/index';
import { registerUser, loginUser, logoutUser, getUserData, onAuthStateChange, supabase } from '../services/supabaseService';

const badgeTemplates: Omit<AppBadge, 'acquired'>[] = [
  { id: 'login_5_days', name: '5日間ログイン', icon: '🗓️' },
  { id: 'first_course', name: 'はじめてのコース', icon: '🎓' },
  { id: 'perfect_lesson', name: 'パーフェクトレッスン', icon: '🎯' },
  { id: 'bug_hunter', name: 'バグハンター', icon: '🐞' },
  { id: 'code_master', name: 'コードマスター', icon: '🏆' },
];

type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  authInitialized: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  completeLesson: (courseId: string, lessonId: string) => void;
  updateAvatar: (style: string, seed: string) => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  loading: false,
  authInitialized: false,
  isAdmin: false,
  isSuperAdmin: false,

  initialize: async () => {
    // 既に初期化済みの場合はスキップ
    if (get().authInitialized) return;

    try {
      // Supabaseからセッションを取得
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // ユーザーデータを取得
        const userData = await getUserData(session.user.id);

        if (userData) {
          const userRole = userData.role || 'student';
          const user: User = {
            uid: session.user.id,
            name: userData.name || session.user.user_metadata?.name || 'ユーザー',
            email: session.user.email || '',
            role: userRole,
            loginStreak: userData.login_streak || 1,
            xp: userData.xp || 0,
            level: userData.level || 1,
            badges: userData.badges || badgeTemplates.map(b => ({ ...b, acquired: false })),
            avatarStyle: userData.avatar_style || 'adventurer',
            avatarSeed: userData.avatar_seed || userData.name || 'default',
            progress: userData.progress || {}
          };

          set({
            user,
            isAuthenticated: true,
            isAdmin: userRole === 'admin' || userRole === 'super_admin',
            isSuperAdmin: userRole === 'super_admin',
            authInitialized: true
          });
          return;
        }
      }

      // セッションがない場合
      set({ authInitialized: true });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ authInitialized: true });
    }
  },

  login: async (email, password) => {
    set({ loading: true });

    // バリデーション
    if (!email || !password) {
      toast.error('メールアドレスとパスワードを入力してください');
      set({ loading: false });
      return;
    }

    if (!email.includes('@')) {
      toast.error('正しいメールアドレスを入力してください');
      set({ loading: false });
      return;
    }

    if (password.length < 6) {
      toast.error('パスワードは6文字以上である必要があります');
      set({ loading: false });
      return;
    }

    try {
      // Supabaseでログイン
      const supabaseUser = await loginUser(email, password);

      // Supabaseからユーザーデータを取得
      const userData = await getUserData(supabaseUser.id);

      if (userData) {
        const userRole = userData.role || 'student';
        const user: User = {
          uid: supabaseUser.id,
          name: userData.name || supabaseUser.user_metadata?.name || 'ユーザー',
          email: supabaseUser.email || email,
          role: userRole,
          loginStreak: userData.login_streak || 1,
          xp: userData.xp || 0,
          level: userData.level || 1,
          badges: userData.badges || badgeTemplates.map(b => ({ ...b, acquired: false })),
          avatarStyle: userData.avatar_style || 'adventurer',
          avatarSeed: userData.avatar_seed || userData.name || 'default',
          progress: userData.progress || {}
        };

        set({
          user,
          isAuthenticated: true,
          isAdmin: userRole === 'admin' || userRole === 'super_admin',
          isSuperAdmin: userRole === 'super_admin',
          loading: false
        });
        toast.success(`おかえりなさい、${user.name}さん！`);
      } else {
        throw new Error('ユーザーデータが見つかりません');
      }
    } catch (error: any) {
      console.error('Login error:', error);

      // Supabaseエラーメッセージを日本語化
      let errorMessage = 'ログインに失敗しました';
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'メールアドレスまたはパスワードが間違っています';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'メールアドレスの確認が必要です';
      } else if (error.message.includes('Too many requests')) {
        errorMessage = 'ログイン試行回数が多すぎます。しばらくしてからお試しください';
      }

      toast.error(errorMessage);
      set({ loading: false });
    }
  },

  register: async (name, email, password) => {
    set({ loading: true });

    // バリデーション
    if (!name || !email || !password) {
      toast.error('すべての項目を入力してください');
      set({ loading: false });
      return;
    }

    if (name.trim().length < 2) {
      toast.error('名前は2文字以上である必要があります');
      set({ loading: false });
      return;
    }

    if (!email.includes('@')) {
      toast.error('正しいメールアドレスを入力してください');
      set({ loading: false });
      return;
    }

    if (password.length < 6) {
      toast.error('パスワードは6文字以上である必要があります');
      set({ loading: false });
      return;
    }

    try {
      // Supabaseでユーザー登録（usersテーブルへの保存も含む）
      const supabaseUser = await registerUser(name, email, password);

      // 新規ユーザーデータを作成
      const user: User = {
        uid: supabaseUser.id,
        name: name,
        email: email,
        role: 'student',  // 新規ユーザーはデフォルトでstudent
        loginStreak: 1,
        xp: 0,
        level: 1,
        badges: badgeTemplates.map(b => ({ ...b, acquired: false })),
        progress: {}
      };

      set({
        user,
        isAuthenticated: true,
        isAdmin: false,
        isSuperAdmin: false,
        loading: false
      });
      toast.success(`ようこそ、${name}さん！冒険をはじめましょう！`);
    } catch (error: any) {
      console.error('Registration error:', error);

      // Supabaseエラーメッセージを日本語化
      let errorMessage = '登録に失敗しました';
      if (error.message.includes('already registered') || error.message.includes('already been registered')) {
        errorMessage = 'このメールアドレスは既に使用されています';
      } else if (error.message.includes('invalid') && error.message.includes('email')) {
        errorMessage = 'メールアドレスの形式が正しくありません';
      } else if (error.message.includes('Password') || error.message.includes('password')) {
        errorMessage = 'パスワードが弱すぎます。6文字以上で設定してください';
      }

      toast.error(errorMessage);
      set({ loading: false });
    }
  },

  logout: async () => {
    try {
      await logoutUser();
      set({
        user: null,
        isAuthenticated: false,
        isAdmin: false,
        isSuperAdmin: false
      });
      toast.success('ログアウトしました。またね！');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('ログアウトに失敗しました');
    }
  },

  completeLesson: (courseId, lessonId) => {
    set((state) => {
      if (!state.user) return state;

      const newProgress = { ...state.user.progress };
      if (!newProgress[courseId]) {
        newProgress[courseId] = { completedLessons: [] };
      }

      const completed = newProgress[courseId].completedLessons;
      if (!completed.includes(lessonId)) {
        newProgress[courseId].completedLessons = [...completed, lessonId];
      }

      return {
        user: {
          ...state.user,
          progress: newProgress,
        },
      };
    });
  },

  updateAvatar: (style, seed) => {
    set((state) => {
      if (!state.user) return state;
      return {
        user: {
          ...state.user,
          avatarStyle: style,
          avatarSeed: seed,
        },
      };
    });
  },
}));

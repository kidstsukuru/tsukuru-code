// ユーザーロール
export type UserRole = 'student' | 'admin' | 'super_admin';

// データベースユーザー型（Supabaseから取得）
export interface DBUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

// アプリケーションユーザー型（フロントエンド状態管理用）
export interface User {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  loginStreak: number;
  xp: number;
  level: number;
  badges: AppBadge[];
  progress: {
    [courseId: string]: {
      completedLessons: string[];
    }
  };
}

// アプリケーション用バッジ型（フロントエンド用）
export interface AppBadge {
  id: string;
  name: string;
  icon: string; // Emoji or SVG component name
  acquired: boolean;
}

// 監査ログ
export interface AuditLog {
  id: string;
  admin_id: string;
  action: 'create' | 'update' | 'delete';
  target_type: 'course' | 'lesson' | 'quiz' | 'user';
  target_id: string;
  changes: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// コース
export interface Course {
  id: string;
  title: string;
  description: string;
  icon?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_hours: number;
  is_published: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

// レベル
export interface Level {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  level_number: number;
  bonus_xp: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

// レッスン
export interface Lesson {
  id: string;
  course_id: string;
  level_id?: string;  // 所属するレベルのID
  title: string;
  description: string;
  content?: Record<string, any>;  // JSONBコンテンツ
  youtube_url?: string;  // YouTube動画URL
  order_index: number;
  xp_reward?: number;
  duration_minutes?: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

// クイズ
export interface Quiz {
  id: string;
  lesson_id: string;
  question: string;
  question_type: 'multiple_choice' | 'code' | 'drag_drop';
  options?: string[];
  correct_answer: string;
  explanation?: string;
  points: number;
  order_index: number;
  created_at: string;
  updated_at?: string;
}

// ユーザー進捗
export interface UserProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress_percentage: number;
  last_accessed_at: string;
  completed_at?: string;
}

// ユーザーレベル進捗
export interface UserLevelProgress {
  id: string;
  user_id: string;
  level_id: string;
  is_completed: boolean;
  completed_at?: string;
  bonus_xp_awarded: boolean;
  created_at: string;
  updated_at: string;
}

// データベース用バッジ型（Supabaseから取得）
export interface DBBadge {
  id: string;
  name: string;
  name_en?: string;
  description: string;
  icon_url?: string;
  criteria: Record<string, any>;  // 獲得条件
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  created_at: string;
}

// データベース用ユーザーバッジ型
export interface DBUserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
}

// 後方互換性のためのエイリアス
export type Badge = DBBadge;
export type UserBadge = DBUserBadge;

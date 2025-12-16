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

// =====================================================
// クリエイターズワールド関連の型定義
// =====================================================

// 作品
export interface Creation {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  code_url: string;  // Scratchプロジェクトリンクまたは埋め込みコードURL
  plays: number;
  likes: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  // フロントエンド用の拡張フィールド（JOIN結果）
  creator?: {
    id: string;
    name: string;
  };
  is_liked?: boolean;  // 現在のユーザーがいいねしているか
}

// いいね
export interface CreationLike {
  id: string;
  user_id: string;
  creation_id: string;
  created_at: string;
}

// 再生履歴
export interface CreationPlay {
  id: string;
  user_id?: string;  // ゲストユーザーも考慮してoptional
  creation_id: string;
  played_at: string;
}

// =====================================================
// サブスクリプションシステム関連の型定義
// =====================================================

// プラン名
export type PlanName = 'free' | 'premium' | 'family';

// サブスクリプションステータス
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';

// サブスクリプション履歴のアクション
export type SubscriptionAction =
  | 'created'
  | 'upgraded'
  | 'downgraded'
  | 'canceled'
  | 'renewed'
  | 'payment_failed'
  | 'status_changed';

// プラン機能
export interface PlanFeatures {
  courses_access: 'limited' | 'all';
  max_level: number | 'unlimited';
  creations_per_month: number | 'unlimited';
  ads: boolean;
  support: 'community' | 'priority';
  badges: boolean;
  progress_reports: boolean;
  priority_support: boolean;
  priority_response_time?: string;
  family_accounts?: number;
  parent_dashboard?: boolean;
  learning_time_management?: boolean;
  family_gallery?: boolean;
}

// プラン制限
export interface PlanLimits {
  max_courses: number | null;
  max_level: number | null;
  creations_per_month: number | null;
  max_family_members?: number;
}

// サブスクリプションプラン
export interface Plan {
  id: string;
  name: PlanName;
  display_name: string;
  description?: string;
  price: number;  // 月額料金（円）
  stripe_price_id?: string;
  features: PlanFeatures;
  limits: PlanLimits;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// ユーザーのサブスクリプション
export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  status: SubscriptionStatus;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  canceled_at?: string;
  trial_start?: string;
  trial_end?: string;
  created_at: string;
  updated_at: string;
  // フロントエンド用の拡張フィールド（JOIN結果）
  plan?: Plan;
}

// サブスクリプション履歴
export interface SubscriptionHistory {
  id: string;
  user_id: string;
  subscription_id?: string;
  plan_id: string;
  action: SubscriptionAction;
  status_before?: SubscriptionStatus;
  status_after?: SubscriptionStatus;
  amount?: number;  // 支払額（円）
  metadata?: Record<string, any>;
  created_at: string;
  // フロントエンド用の拡張フィールド（JOIN結果）
  plan?: Plan;
}

// ファミリープランメンバー
export interface FamilyMember {
  id: string;
  subscription_id: string;
  parent_user_id: string;
  child_user_id: string;
  nickname?: string;
  learning_time_limit?: number;  // 1日の学習時間制限（分）
  allowed_courses?: string[];  // 許可されたコースID配列
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // フロントエンド用の拡張フィールド（JOIN結果）
  child_user?: DBUser;
  parent_user?: DBUser;
}

// アクティブなサブスクリプション（ビュー用）
export interface ActiveSubscriptionWithPlan extends Subscription {
  plan_name: PlanName;
  plan_display_name: string;
  plan_price: number;
  plan_features: PlanFeatures;
  plan_limits: PlanLimits;
  user_email: string;
  user_name: string;
}

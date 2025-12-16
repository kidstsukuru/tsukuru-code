import { supabase } from './supabaseService';
import type {
  Plan,
  Subscription,
  SubscriptionHistory,
  FamilyMember,
  PlanName,
  SubscriptionStatus,
  SubscriptionAction,
} from '../types';

// =====================================================
// プラン関連
// =====================================================

/**
 * 全てのアクティブなプランを取得
 */
export const getPlans = async (): Promise<Plan[]> => {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching plans:', error);
    throw error;
  }

  return data || [];
};

/**
 * プランIDからプラン情報を取得
 */
export const getPlanById = async (planId: string): Promise<Plan | null> => {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('id', planId)
    .single();

  if (error) {
    console.error('Error fetching plan:', error);
    return null;
  }

  return data;
};

/**
 * プラン名からプラン情報を取得
 */
export const getPlanByName = async (name: PlanName): Promise<Plan | null> => {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('name', name)
    .single();

  if (error) {
    console.error('Error fetching plan by name:', error);
    return null;
  }

  return data;
};

// =====================================================
// サブスクリプション関連
// =====================================================

/**
 * ユーザーのアクティブなサブスクリプションを取得
 */
export const getUserSubscription = async (userId: string): Promise<Subscription | null> => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      plan:plans(*)
    `)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows found
      return null;
    }
    console.error('Error fetching user subscription:', error);
    throw error;
  }

  return data;
};

/**
 * サブスクリプションを作成（管理者用）
 */
export const createSubscription = async (
  userId: string,
  planId: string,
  stripeData?: {
    customerId: string;
    subscriptionId: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
  }
): Promise<Subscription> => {
  const subscriptionData: any = {
    user_id: userId,
    plan_id: planId,
    status: 'active' as SubscriptionStatus,
    current_period_start: stripeData?.currentPeriodStart || new Date().toISOString(),
  };

  if (stripeData) {
    subscriptionData.stripe_customer_id = stripeData.customerId;
    subscriptionData.stripe_subscription_id = stripeData.subscriptionId;
    subscriptionData.current_period_end = stripeData.currentPeriodEnd;
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .insert(subscriptionData)
    .select()
    .single();

  if (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }

  return data;
};

/**
 * サブスクリプションを更新（管理者用）
 */
export const updateSubscription = async (
  subscriptionId: string,
  updates: Partial<Subscription>
): Promise<Subscription> => {
  const { data, error } = await supabase
    .from('subscriptions')
    .update(updates)
    .eq('id', subscriptionId)
    .select()
    .single();

  if (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }

  return data;
};

/**
 * サブスクリプションをキャンセル
 */
export const cancelSubscription = async (
  subscriptionId: string,
  cancelAtPeriodEnd: boolean = true
): Promise<Subscription> => {
  const updates: Partial<Subscription> = {
    cancel_at_period_end: cancelAtPeriodEnd,
  };

  if (!cancelAtPeriodEnd) {
    updates.status = 'canceled';
    updates.canceled_at = new Date().toISOString();
  }

  return updateSubscription(subscriptionId, updates);
};

/**
 * プランをアップグレード/ダウングレード
 */
export const changePlan = async (
  userId: string,
  newPlanId: string
): Promise<Subscription | null> => {
  const currentSubscription = await getUserSubscription(userId);

  if (!currentSubscription) {
    console.error('No subscription found for user');
    return null;
  }

  return updateSubscription(currentSubscription.id, {
    plan_id: newPlanId,
  });
};

// =====================================================
// サブスクリプション履歴
// =====================================================

/**
 * ユーザーのサブスクリプション履歴を取得
 */
export const getSubscriptionHistory = async (
  userId: string,
  limit: number = 50
): Promise<SubscriptionHistory[]> => {
  const { data, error } = await supabase
    .from('subscription_history')
    .select(`
      *,
      plan:plans(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching subscription history:', error);
    throw error;
  }

  return data || [];
};

/**
 * サブスクリプション履歴を手動で追加（管理者用）
 */
export const addSubscriptionHistory = async (
  userId: string,
  planId: string,
  action: SubscriptionAction,
  metadata?: Record<string, any>
): Promise<SubscriptionHistory> => {
  const { data, error } = await supabase
    .from('subscription_history')
    .insert({
      user_id: userId,
      plan_id: planId,
      action,
      metadata,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding subscription history:', error);
    throw error;
  }

  return data;
};

// =====================================================
// 機能アクセス制御
// =====================================================

/**
 * ユーザーが特定の機能にアクセスできるかチェック
 */
export const checkFeatureAccess = async (
  userId: string,
  feature: keyof Plan['features']
): Promise<boolean> => {
  const subscription = await getUserSubscription(userId);

  if (!subscription || !subscription.plan) {
    return false;
  }

  const featureValue = subscription.plan.features[feature];

  // Boolean型の機能
  if (typeof featureValue === 'boolean') {
    return featureValue;
  }

  // 'all' や 'unlimited' の場合はtrue
  if (featureValue === 'all' || featureValue === 'unlimited') {
    return true;
  }

  return false;
};

/**
 * ユーザーが特定のコースにアクセスできるかチェック
 */
export const checkCourseAccess = async (
  userId: string,
  courseId: string
): Promise<boolean> => {
  const subscription = await getUserSubscription(userId);

  if (!subscription || !subscription.plan) {
    return false;
  }

  // 全コースアクセス可能な場合
  if (subscription.plan.features.courses_access === 'all') {
    return true;
  }

  // 無料プランの場合、制限内かチェック
  // TODO: ここで実際のコース数をチェックするロジックを追加
  return true;
};

/**
 * ユーザーが特定のレベルにアクセスできるかチェック
 */
export const checkLevelAccess = async (
  userId: string,
  levelNumber: number
): Promise<boolean> => {
  const subscription = await getUserSubscription(userId);

  if (!subscription || !subscription.plan) {
    return false;
  }

  const maxLevel = subscription.plan.features.max_level;

  if (maxLevel === 'unlimited') {
    return true;
  }

  return levelNumber <= maxLevel;
};

/**
 * 今月の作品投稿数をチェック
 */
export const checkCreationLimit = async (userId: string): Promise<{
  canCreate: boolean;
  currentCount: number;
  limit: number | 'unlimited';
}> => {
  const subscription = await getUserSubscription(userId);

  if (!subscription || !subscription.plan) {
    return { canCreate: false, currentCount: 0, limit: 0 };
  }

  const limit = subscription.plan.features.creations_per_month;

  if (limit === 'unlimited') {
    return { canCreate: true, currentCount: 0, limit: 'unlimited' };
  }

  // 今月の作品投稿数を取得
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from('creations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startOfMonth.toISOString());

  if (error) {
    console.error('Error checking creation count:', error);
    return { canCreate: false, currentCount: 0, limit };
  }

  const currentCount = count || 0;
  return {
    canCreate: currentCount < limit,
    currentCount,
    limit,
  };
};

// =====================================================
// ファミリープラン関連
// =====================================================

/**
 * ファミリーメンバーを追加
 */
export const addFamilyMember = async (
  subscriptionId: string,
  parentUserId: string,
  childUserId: string,
  options?: {
    nickname?: string;
    learningTimeLimit?: number;
    allowedCourses?: string[];
  }
): Promise<FamilyMember> => {
  const { data, error } = await supabase
    .from('family_members')
    .insert({
      subscription_id: subscriptionId,
      parent_user_id: parentUserId,
      child_user_id: childUserId,
      nickname: options?.nickname,
      learning_time_limit: options?.learningTimeLimit,
      allowed_courses: options?.allowedCourses || [],
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding family member:', error);
    throw error;
  }

  return data;
};

/**
 * ファミリーメンバー一覧を取得
 */
export const getFamilyMembers = async (parentUserId: string): Promise<FamilyMember[]> => {
  const { data, error } = await supabase
    .from('family_members')
    .select(`
      *,
      child_user:users!family_members_child_user_id_fkey(id, name, email)
    `)
    .eq('parent_user_id', parentUserId)
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching family members:', error);
    throw error;
  }

  return data || [];
};

/**
 * ファミリーメンバーを削除
 */
export const removeFamilyMember = async (memberId: string): Promise<void> => {
  const { error } = await supabase
    .from('family_members')
    .update({ is_active: false })
    .eq('id', memberId);

  if (error) {
    console.error('Error removing family member:', error);
    throw error;
  }
};

/**
 * ファミリーメンバーの設定を更新
 */
export const updateFamilyMember = async (
  memberId: string,
  updates: Partial<FamilyMember>
): Promise<FamilyMember> => {
  const { data, error } = await supabase
    .from('family_members')
    .update(updates)
    .eq('id', memberId)
    .select()
    .single();

  if (error) {
    console.error('Error updating family member:', error);
    throw error;
  }

  return data;
};

// =====================================================
// ユーティリティ関数
// =====================================================

/**
 * サブスクリプションがアクティブかチェック
 */
export const isSubscriptionActive = (subscription: Subscription | null): boolean => {
  if (!subscription) return false;

  if (subscription.status !== 'active') return false;

  if (subscription.current_period_end) {
    const endDate = new Date(subscription.current_period_end);
    if (endDate < new Date()) {
      return false;
    }
  }

  return true;
};

/**
 * プランの比較（アップグレードかダウングレードか判定）
 */
export const comparePlans = (
  currentPlan: Plan,
  newPlan: Plan
): 'upgrade' | 'downgrade' | 'same' => {
  if (currentPlan.price < newPlan.price) {
    return 'upgrade';
  } else if (currentPlan.price > newPlan.price) {
    return 'downgrade';
  }
  return 'same';
};

/**
 * サブスクリプションの残り日数を取得
 */
export const getDaysUntilRenewal = (subscription: Subscription | null): number => {
  if (!subscription || !subscription.current_period_end) {
    return 0;
  }

  const endDate = new Date(subscription.current_period_end);
  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
};

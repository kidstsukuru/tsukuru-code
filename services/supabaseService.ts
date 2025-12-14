import { createClient, type User as SupabaseUser } from '@supabase/supabase-js';

// Supabase設定
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// デバッグ: 環境変数の読み込み確認
console.log('Supabase Config:', {
  url: supabaseUrl,
  anonKey: supabaseAnonKey ? '***' + supabaseAnonKey.slice(-4) : 'undefined',
  serviceRoleKey: supabaseServiceRoleKey ? '***' + supabaseServiceRoleKey.slice(-4) : 'undefined',
});

// 一般ユーザー用クライアント（RLS適用）
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 管理者用クライアント（RLSバイパス）
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('Supabase initialized successfully');

export type { SupabaseUser };

// ユーザー登録
export const registerUser = async (name: string, email: string, password: string) => {
  try {
    // Supabaseでユーザー登録
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name, // メタデータとして名前を保存
        },
      },
    });

    if (error) throw error;

    if (!data.user) {
      throw new Error('ユーザーの作成に失敗しました');
    }

    // users テーブルにユーザーデータを保存
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        name,
        email,
        login_streak: 1,
        xp: 0,
        level: 1,
        role: 'student',
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Error saving user data:', insertError);
      // ユーザーは作成されたが、追加データの保存に失敗した場合でも続行
    }

    return data.user;
  } catch (error: any) {
    console.error('Registration error:', error);
    throw new Error(error.message || '登録に失敗しました');
  }
};

// ログイン
export const loginUser = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (!data.user) {
      throw new Error('ログインに失敗しました');
    }

    return data.user;
  } catch (error: any) {
    console.error('Login error:', error);
    throw new Error(error.message || 'ログインに失敗しました');
  }
};

// ログアウト
export const logoutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error: any) {
    console.error('Logout error:', error);
    throw new Error(error.message || 'ログアウトに失敗しました');
  }
};

// ユーザーデータを取得
export const getUserData = async (uid: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', uid)
      .single();

    if (error) {
      // ユーザーデータが見つからない場合は null を返す（初回登録時など）
      if (error.code === 'PGRST116') {
        console.log('No user data found');
        return null;
      }
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error('Error getting user data:', error);
    throw new Error(error.message || 'ユーザーデータの取得に失敗しました');
  }
};

// 認証状態の変更を監視
export const onAuthStateChange = (callback: (user: SupabaseUser | null) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user ?? null);
  });
};

// ====================================
// コース・レッスン関連
// ====================================

// 公開されているコースを取得
export const getPublishedCourses = async () => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('is_published', true)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error getting courses:', error);
    throw new Error(error.message || 'コースの取得に失敗しました');
  }
};

// 特定のコースを取得
export const getCourseById = async (courseId: string) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error getting course:', error);
    throw new Error(error.message || 'コースの取得に失敗しました');
  }
};

// コースのレベルを取得
export const getLevelsByCourse = async (courseId: string) => {
  try {
    const { data, error } = await supabase
      .from('levels')
      .select('*')
      .eq('course_id', courseId)
      .eq('is_published', true)
      .order('level_number', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error getting levels:', error);
    throw new Error(error.message || 'レベルの取得に失敗しました');
  }
};

// 特定のレベルを取得
export const getLevelById = async (levelId: string) => {
  try {
    const { data, error } = await supabase
      .from('levels')
      .select('*')
      .eq('id', levelId)
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error getting level:', error);
    throw new Error(error.message || 'レベルの取得に失敗しました');
  }
};

// レベルのレッスンを取得
export const getLessonsByLevel = async (levelId: string) => {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('level_id', levelId)
      .eq('is_published', true)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error getting lessons by level:', error);
    throw new Error(error.message || 'レッスンの取得に失敗しました');
  }
};

// コースのレッスンを取得（後方互換性のため残す）
export const getLessonsByCourse = async (courseId: string) => {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .eq('is_published', true)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error getting lessons:', error);
    throw new Error(error.message || 'レッスンの取得に失敗しました');
  }
};

// ====================================
// 学習進捗関連
// ====================================

// ユーザーの進捗を取得
export const getUserProgress = async (userId: string, courseId?: string) => {
  try {
    let query = supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId);

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error getting user progress:', error);
    throw new Error(error.message || '学習進捗の取得に失敗しました');
  }
};

// ユーザーのレベル進捗を取得
export const getUserLevelProgress = async (userId: string, levelId?: string) => {
  try {
    let query = supabase
      .from('user_level_progress')
      .select('*')
      .eq('user_id', userId);

    if (levelId) {
      query = query.eq('level_id', levelId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error getting user level progress:', error);
    throw new Error(error.message || 'レベル進捗の取得に失敗しました');
  }
};

// レッスン完了を記録
export const completeLesson = async (
  userId: string,
  lessonId: string,
  courseId: string,
  score: number,
  timeSpent: number
) => {
  try {
    // 既存の進捗をチェック
    const { data: existing } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .single();

    if (existing) {
      // 既に記録がある場合は更新
      const { data, error } = await supabase
        .from('user_progress')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
          score: Math.max(existing.score || 0, score), // 最高スコアを保持
          attempts: (existing.attempts || 0) + 1,
          time_spent: (existing.time_spent || 0) + timeSpent,
        })
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // 新規記録
      const { data, error } = await supabase
        .from('user_progress')
        .insert({
          user_id: userId,
          lesson_id: lessonId,
          course_id: courseId,
          completed: true,
          completed_at: new Date().toISOString(),
          score,
          attempts: 1,
          time_spent: timeSpent,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  } catch (error: any) {
    console.error('Error completing lesson:', error);
    throw new Error(error.message || 'レッスン完了の記録に失敗しました');
  }
};

// レベル完了をチェックしてボーナスXPを付与
export const checkAndCompleteLevelIfNeeded = async (userId: string, levelId: string) => {
  try {
    // レベルの全レッスンを取得
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('id')
      .eq('level_id', levelId)
      .eq('is_published', true);

    if (lessonsError) throw lessonsError;
    if (!lessons || lessons.length === 0) return null;

    // ユーザーの進捗を取得
    const { data: userProgress, error: progressError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .in('lesson_id', lessons.map(l => l.id));

    if (progressError) throw progressError;

    // 全レッスンが完了しているかチェック
    const completedLessons = userProgress?.filter(p => p.completed) || [];
    const allLessonsCompleted = completedLessons.length === lessons.length;

    if (!allLessonsCompleted) return null;

    // 既にレベル進捗が記録されているかチェック
    const { data: existingProgress } = await supabase
      .from('user_level_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('level_id', levelId)
      .single();

    if (existingProgress && existingProgress.is_completed) {
      // 既に完了済み
      return null;
    }

    // レベル情報を取得してボーナスXPを確認
    const { data: level, error: levelError } = await supabase
      .from('levels')
      .select('bonus_xp')
      .eq('id', levelId)
      .single();

    if (levelError) throw levelError;

    // レベル進捗を作成または更新
    if (existingProgress) {
      // 更新
      const { error: updateError } = await supabase
        .from('user_level_progress')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
          bonus_xp_awarded: true,
        })
        .eq('user_id', userId)
        .eq('level_id', levelId);

      if (updateError) throw updateError;
    } else {
      // 新規作成
      const { error: insertError } = await supabase
        .from('user_level_progress')
        .insert({
          user_id: userId,
          level_id: levelId,
          is_completed: true,
          completed_at: new Date().toISOString(),
          bonus_xp_awarded: true,
        });

      if (insertError) throw insertError;
    }

    // ボーナスXPを付与
    if (level.bonus_xp > 0) {
      await updateUserXP(userId, level.bonus_xp);
    }

    return {
      levelCompleted: true,
      bonusXP: level.bonus_xp,
    };
  } catch (error: any) {
    console.error('Error checking level completion:', error);
    throw new Error(error.message || 'レベル完了チェックに失敗しました');
  }
};

// ユーザーのXPとレベルを更新
export const updateUserXP = async (userId: string, xpToAdd: number) => {
  try {
    // 現在のユーザーデータを取得
    const { data: userData, error: getUserError } = await supabase
      .from('users')
      .select('xp, level')
      .eq('id', userId)
      .single();

    if (getUserError) throw getUserError;

    const newXP = (userData.xp || 0) + xpToAdd;
    const newLevel = calculateLevel(newXP);

    // XPとレベルを更新
    const { data, error } = await supabase
      .from('users')
      .update({
        xp: newXP,
        level: newLevel,
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error updating user XP:', error);
    throw new Error(error.message || 'XPの更新に失敗しました');
  }
};

// レベル計算関数（100XPごとにレベルアップ）
const calculateLevel = (xp: number): number => {
  return Math.floor(xp / 100) + 1;
};

// ====================================
// バッジ関連
// ====================================

// すべてのバッジテンプレートを取得
export const getBadgeTemplates = async () => {
  try {
    const { data, error } = await supabase
      .from('badge_templates')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error getting badge templates:', error);
    throw new Error(error.message || 'バッジテンプレートの取得に失敗しました');
  }
};

// ユーザーの獲得済みバッジを取得
export const getUserBadges = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_badges')
      .select('*, badge_templates(*)')
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error getting user badges:', error);
    throw new Error(error.message || 'バッジの取得に失敗しました');
  }
};

// バッジを付与
export const awardBadge = async (userId: string, badgeId: string) => {
  try {
    // 既に獲得済みかチェック
    const { data: existing } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', userId)
      .eq('badge_id', badgeId)
      .single();

    if (existing) {
      return { alreadyAcquired: true, data: existing };
    }

    // バッジを付与
    const { data, error } = await supabase
      .from('user_badges')
      .insert({
        user_id: userId,
        badge_id: badgeId,
      })
      .select()
      .single();

    if (error) throw error;

    // バッジのXP報酬を取得
    const { data: badgeTemplate } = await supabase
      .from('badge_templates')
      .select('xp_reward')
      .eq('id', badgeId)
      .single();

    // XPを追加
    if (badgeTemplate && badgeTemplate.xp_reward > 0) {
      await updateUserXP(userId, badgeTemplate.xp_reward);
    }

    return { alreadyAcquired: false, data };
  } catch (error: any) {
    console.error('Error awarding badge:', error);
    throw new Error(error.message || 'バッジの付与に失敗しました');
  }
};

// バッジ条件をチェック
export const checkBadgeConditions = async (userId: string) => {
  try {
    const newBadges = [];

    // ユーザーデータと進捗を取得
    const [userData, userProgress, userBadges] = await Promise.all([
      getUserData(userId),
      getUserProgress(userId),
      getUserBadges(userId),
    ]);

    if (!userData) return [];

    const acquiredBadgeIds = userBadges.map((b: any) => b.badge_id);

    // 初ログインバッジ
    if (!acquiredBadgeIds.includes('first_login')) {
      const result = await awardBadge(userId, 'first_login');
      if (!result.alreadyAcquired) {
        newBadges.push('first_login');
      }
    }

    // ログイン連続日数バッジ
    if (userData.login_streak >= 5 && !acquiredBadgeIds.includes('login_5_days')) {
      const result = await awardBadge(userId, 'login_5_days');
      if (!result.alreadyAcquired) {
        newBadges.push('login_5_days');
      }
    }

    if (userData.login_streak >= 10 && !acquiredBadgeIds.includes('login_10_days')) {
      const result = await awardBadge(userId, 'login_10_days');
      if (!result.alreadyAcquired) {
        newBadges.push('login_10_days');
      }
    }

    // 初レッスン完了バッジ
    const completedLessons = userProgress.filter((p: any) => p.completed);
    if (completedLessons.length >= 1 && !acquiredBadgeIds.includes('first_lesson')) {
      const result = await awardBadge(userId, 'first_lesson');
      if (!result.alreadyAcquired) {
        newBadges.push('first_lesson');
      }
    }

    // パーフェクトスコアバッジ
    const perfectScores = completedLessons.filter((p: any) => p.score === 100);
    if (perfectScores.length >= 1 && !acquiredBadgeIds.includes('perfect_score')) {
      const result = await awardBadge(userId, 'perfect_score');
      if (!result.alreadyAcquired) {
        newBadges.push('perfect_score');
      }
    }

    return newBadges;
  } catch (error: any) {
    console.error('Error checking badge conditions:', error);
    return [];
  }
};

// =====================================================
// クリエイターズワールド関連の関数
// =====================================================

/**
 * 作品一覧を取得（公開作品のみ）
 * @param limit 取得件数（デフォルト: 50）
 * @param offset オフセット（ページネーション用、デフォルト: 0）
 * @param sortBy ソート基準（plays, likes, created_at）
 * @param userId 現在のユーザーID（いいね状態を取得するため、optional）
 */
export const getCreations = async (
  limit = 50,
  offset = 0,
  sortBy: 'plays' | 'likes' | 'created_at' = 'created_at',
  userId?: string
) => {
  try {
    let query = supabase
      .from('creations')
      .select(`
        *,
        creator:users!creations_user_id_fkey(id, name)
      `)
      .eq('is_published', true)
      .order(sortBy, { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) throw error;

    // いいね状態を取得（ユーザーがログインしている場合）
    if (userId && data) {
      const creationIds = data.map((c: any) => c.id);
      const { data: likes } = await supabase
        .from('creation_likes')
        .select('creation_id')
        .eq('user_id', userId)
        .in('creation_id', creationIds);

      const likedIds = new Set(likes?.map((l: any) => l.creation_id) || []);

      return data.map((creation: any) => ({
        ...creation,
        is_liked: likedIds.has(creation.id),
      }));
    }

    return data || [];
  } catch (error: any) {
    console.error('Error fetching creations:', error);
    throw new Error(error.message || '作品の取得に失敗しました');
  }
};

/**
 * 作品詳細を取得
 * @param creationId 作品ID
 * @param userId 現在のユーザーID（いいね状態を取得するため、optional）
 */
export const getCreationById = async (creationId: string, userId?: string) => {
  try {
    const { data, error } = await supabase
      .from('creations')
      .select(`
        *,
        creator:users!creations_user_id_fkey(id, name)
      `)
      .eq('id', creationId)
      .single();

    if (error) throw error;

    // いいね状態を取得
    if (userId) {
      const { data: like } = await supabase
        .from('creation_likes')
        .select('id')
        .eq('user_id', userId)
        .eq('creation_id', creationId)
        .single();

      return {
        ...data,
        is_liked: !!like,
      };
    }

    return data;
  } catch (error: any) {
    console.error('Error fetching creation:', error);
    throw new Error(error.message || '作品の取得に失敗しました');
  }
};

/**
 * ユーザーの作品一覧を取得
 * @param userId ユーザーID
 * @param includeUnpublished 非公開作品も含めるか（デフォルト: false）
 */
export const getUserCreations = async (userId: string, includeUnpublished = false) => {
  try {
    let query = supabase
      .from('creations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!includeUnpublished) {
      query = query.eq('is_published', true);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error: any) {
    console.error('Error fetching user creations:', error);
    throw new Error(error.message || 'ユーザーの作品取得に失敗しました');
  }
};

/**
 * 作品を投稿
 * @param creation 作品データ
 */
export const createCreation = async (creation: {
  user_id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  code_url: string;
  is_published?: boolean;
}) => {
  try {
    const { data, error } = await supabase
      .from('creations')
      .insert({
        ...creation,
        plays: 0,
        likes: 0,
        is_published: creation.is_published ?? true,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error: any) {
    console.error('Error creating creation:', error);
    throw new Error(error.message || '作品の投稿に失敗しました');
  }
};

/**
 * 作品を更新
 * @param creationId 作品ID
 * @param updates 更新データ
 */
export const updateCreation = async (
  creationId: string,
  updates: {
    title?: string;
    description?: string;
    thumbnail_url?: string;
    code_url?: string;
    is_published?: boolean;
  }
) => {
  try {
    const { data, error } = await supabase
      .from('creations')
      .update(updates)
      .eq('id', creationId)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error: any) {
    console.error('Error updating creation:', error);
    throw new Error(error.message || '作品の更新に失敗しました');
  }
};

/**
 * 作品を削除
 * @param creationId 作品ID
 */
export const deleteCreation = async (creationId: string) => {
  try {
    const { error } = await supabase
      .from('creations')
      .delete()
      .eq('id', creationId);

    if (error) throw error;

    return true;
  } catch (error: any) {
    console.error('Error deleting creation:', error);
    throw new Error(error.message || '作品の削除に失敗しました');
  }
};

/**
 * 作品にいいねを追加
 * @param userId ユーザーID
 * @param creationId 作品ID
 */
export const likeCreation = async (userId: string, creationId: string) => {
  try {
    const { error } = await supabase
      .from('creation_likes')
      .insert({
        user_id: userId,
        creation_id: creationId,
      });

    if (error) {
      // 既にいいね済みの場合
      if (error.code === '23505') {
        throw new Error('既にいいね済みです');
      }
      throw error;
    }

    return true;
  } catch (error: any) {
    console.error('Error liking creation:', error);
    throw new Error(error.message || 'いいねに失敗しました');
  }
};

/**
 * 作品のいいねを削除
 * @param userId ユーザーID
 * @param creationId 作品ID
 */
export const unlikeCreation = async (userId: string, creationId: string) => {
  try {
    const { error } = await supabase
      .from('creation_likes')
      .delete()
      .eq('user_id', userId)
      .eq('creation_id', creationId);

    if (error) throw error;

    return true;
  } catch (error: any) {
    console.error('Error unliking creation:', error);
    throw new Error(error.message || 'いいね解除に失敗しました');
  }
};

/**
 * 作品の再生回数を記録
 * @param creationId 作品ID
 * @param userId ユーザーID（optional、ゲストユーザーの場合はnull）
 */
export const recordPlay = async (creationId: string, userId?: string) => {
  try {
    const { error } = await supabase
      .from('creation_plays')
      .insert({
        creation_id: creationId,
        user_id: userId || null,
      });

    if (error) throw error;

    return true;
  } catch (error: any) {
    console.error('Error recording play:', error);
    // 再生回数の記録失敗は致命的ではないのでエラーをスローしない
    return false;
  }
};

/**
 * 作品を検索
 * @param searchQuery 検索クエリ
 * @param limit 取得件数
 */
export const searchCreations = async (searchQuery: string, limit = 20) => {
  try {
    const { data, error } = await supabase
      .from('creations')
      .select(`
        *,
        creator:users!creations_user_id_fkey(id, name)
      `)
      .eq('is_published', true)
      .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data || [];
  } catch (error: any) {
    console.error('Error searching creations:', error);
    throw new Error(error.message || '検索に失敗しました');
  }
};

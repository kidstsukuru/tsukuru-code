import { supabase } from './supabaseService';
import { Course, Level, Lesson, DBUser, UserRole } from '../types/index';

// ====================================
// Course Management
// ====================================

export const getAllCourses = async (): Promise<Course[]> => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching courses:', error);
    throw new Error(error.message);
  }

  return data || [];
};

export const getCourseById = async (id: string): Promise<Course | null> => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching course:', error);
    throw new Error(error.message);
  }

  return data;
};

export const createCourse = async (course: Omit<Course, 'created_at' | 'updated_at'>): Promise<Course> => {
  const { data, error } = await supabase
    .from('courses')
    .insert([course])
    .select()
    .single();

  if (error) {
    console.error('Error creating course:', error);
    throw new Error(error.message);
  }

  return data;
};

export const updateCourse = async (id: string, updates: Partial<Course>): Promise<Course> => {
  const { data, error } = await supabase
    .from('courses')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating course:', error);
    throw new Error(error.message);
  }

  return data;
};

export const deleteCourse = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting course:', error);
    throw new Error(error.message);
  }
};

export const updateCourseOrder = async (courseIds: string[]): Promise<void> => {
  const updates = courseIds.map((id, index) => ({
    id,
    order_index: index
  }));

  const { error } = await supabase
    .from('courses')
    .upsert(updates);

  if (error) {
    console.error('Error updating course order:', error);
    throw new Error(error.message);
  }
};

// ====================================
// Level Management
// ====================================

export const getLevelsByCourseId = async (courseId: string): Promise<Level[]> => {
  const { data, error } = await supabase
    .from('levels')
    .select('*')
    .eq('course_id', courseId)
    .order('level_number', { ascending: true });

  if (error) {
    console.error('Error fetching levels:', error);
    throw new Error(error.message);
  }

  return data || [];
};

export const getLevelById = async (id: string): Promise<Level | null> => {
  const { data, error } = await supabase
    .from('levels')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching level:', error);
    throw new Error(error.message);
  }

  return data;
};

export const createLevel = async (level: Omit<Level, 'created_at' | 'updated_at'>): Promise<Level> => {
  const { data, error } = await supabase
    .from('levels')
    .insert([level])
    .select()
    .single();

  if (error) {
    console.error('Error creating level:', error);
    throw new Error(error.message);
  }

  return data;
};

export const updateLevel = async (id: string, updates: Partial<Level>): Promise<Level> => {
  const { data, error } = await supabase
    .from('levels')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating level:', error);
    throw new Error(error.message);
  }

  return data;
};

export const deleteLevel = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('levels')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting level:', error);
    throw new Error(error.message);
  }
};

export const updateLevelOrder = async (levelIds: string[]): Promise<void> => {
  const updates = levelIds.map((id, index) => ({
    id,
    level_number: index + 1
  }));

  const { error } = await supabase
    .from('levels')
    .upsert(updates);

  if (error) {
    console.error('Error updating level order:', error);
    throw new Error(error.message);
  }
};

// ====================================
// Lesson Management
// ====================================

export const getLessonsByCourseId = async (courseId: string): Promise<Lesson[]> => {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('course_id', courseId)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching lessons:', error);
    throw new Error(error.message);
  }

  return data || [];
};

export const getLessonsByLevelId = async (levelId: string): Promise<Lesson[]> => {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('level_id', levelId)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching lessons by level:', error);
    throw new Error(error.message);
  }

  return data || [];
};

export const getLessonById = async (id: string): Promise<Lesson | null> => {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching lesson:', error);
    throw new Error(error.message);
  }

  return data;
};

export const createLesson = async (lesson: Omit<Lesson, 'created_at' | 'updated_at'>): Promise<Lesson> => {
  const { data, error } = await supabase
    .from('lessons')
    .insert([lesson])
    .select()
    .single();

  if (error) {
    console.error('Error creating lesson:', error);
    throw new Error(error.message);
  }

  return data;
};

export const updateLesson = async (id: string, updates: Partial<Lesson>): Promise<Lesson> => {
  const { data, error } = await supabase
    .from('lessons')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating lesson:', error);
    throw new Error(error.message);
  }

  return data;
};

export const deleteLesson = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('lessons')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting lesson:', error);
    throw new Error(error.message);
  }
};

export const updateLessonOrder = async (lessonIds: string[]): Promise<void> => {
  const updates = lessonIds.map((id, index) => ({
    id,
    order_index: index
  }));

  const { error } = await supabase
    .from('lessons')
    .upsert(updates);

  if (error) {
    console.error('Error updating lesson order:', error);
    throw new Error(error.message);
  }
};

// ====================================
// User Management
// ====================================

export interface UserWithStats extends DBUser {
  total_xp: number;
  level: number;
  completed_lessons_count: number;
  total_lessons_count: number;
  last_login?: string;
  is_active: boolean;
}

export const getAllUsers = async (): Promise<UserWithStats[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    throw new Error(error.message);
  }

  // ユーザーごとの統計情報を取得
  const usersWithStats = await Promise.all(
    (data || []).map(async (user) => {
      const stats = await getUserProgressStats(user.id);
      return {
        ...user,
        ...stats,
        is_active: true, // デフォルトは有効
      };
    })
  );

  return usersWithStats;
};

export const getUserById = async (userId: string): Promise<UserWithStats | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    throw new Error(error.message);
  }

  if (!data) return null;

  const stats = await getUserProgressStats(userId);

  return {
    ...data,
    ...stats,
    is_active: true,
  };
};

export const getUserProgressStats = async (userId: string) => {
  // 完了したレッスン数を取得
  const { data: completedLessons, error: completedError } = await supabase
    .from('user_progress')
    .select('lesson_id')
    .eq('user_id', userId)
    .eq('status', 'completed');

  if (completedError) {
    console.error('Error fetching completed lessons:', completedError);
  }

  // 全レッスン数を取得
  const { count: totalLessons, error: totalError } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true });

  if (totalError) {
    console.error('Error fetching total lessons:', totalError);
  }

  // ユーザーデータからXPとレベルを取得
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('xp, level')
    .eq('id', userId)
    .single();

  if (userError) {
    console.error('Error fetching user XP:', userError);
  }

  return {
    total_xp: userData?.xp || 0,
    level: userData?.level || 1,
    completed_lessons_count: completedLessons?.length || 0,
    total_lessons_count: totalLessons || 0,
  };
};

export const updateUserRole = async (userId: string, role: UserRole): Promise<DBUser> => {
  const { data, error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user role:', error);
    throw new Error(error.message);
  }

  // 監査ログに記録
  await logAdminAction('update_user_role', userId, { new_role: role });

  return data;
};

export const toggleUserStatus = async (userId: string, isActive: boolean): Promise<void> => {
  // Supabase Authのユーザーステータスを更新
  // Note: これはsupabase-jsの管理APIを使用する必要があります
  // 現在の実装では、カスタムフィールドでの管理を想定

  const { error } = await supabase
    .from('users')
    .update({ is_active: isActive })
    .eq('id', userId);

  if (error) {
    console.error('Error toggling user status:', error);
    throw new Error(error.message);
  }

  // 監査ログに記録
  await logAdminAction('toggle_user_status', userId, { is_active: isActive });
};

export const searchUsers = async (query: string): Promise<UserWithStats[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching users:', error);
    throw new Error(error.message);
  }

  const usersWithStats = await Promise.all(
    (data || []).map(async (user) => {
      const stats = await getUserProgressStats(user.id);
      return {
        ...user,
        ...stats,
        is_active: true,
      };
    })
  );

  return usersWithStats;
};

// ====================================
// Audit Log
// ====================================

const logAdminAction = async (action: string, targetUserId: string, details: any): Promise<void> => {
  try {
    await supabase.from('audit_logs').insert([
      {
        action,
        target_user_id: targetUserId,
        details,
        created_at: new Date().toISOString(),
      },
    ]);
  } catch (error) {
    console.error('Error logging admin action:', error);
    // ログ記録の失敗は致命的ではないため、エラーを投げない
  }
};

// ====================================
// Analytics & Statistics
// ====================================

export interface AnalyticsStats {
  totalUsers: number;
  activeUsers: number;
  totalCourses: number;
  totalLessons: number;
  totalCreations: number;
  averageCompletionRate: number;
}

export interface CourseStats {
  id: string;
  title: string;
  enrolledUsers: number;
  completionRate: number;
  averageProgress: number;
  totalLessons: number;
}

export interface UserActivityData {
  date: string;
  newUsers: number;
  activeUsers: number;
}

export const getAnalyticsStats = async (): Promise<AnalyticsStats> => {
  // 総ユーザー数
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });

  // アクティブユーザー数（過去30日以内にログインしたユーザー）
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { count: activeUsers } = await supabase
    .from('user_progress')
    .select('user_id', { count: 'exact', head: true })
    .gte('last_accessed_at', thirtyDaysAgo.toISOString())
    .not('user_id', 'is', null);

  // 総コース数
  const { count: totalCourses } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true });

  // 総レッスン数
  const { count: totalLessons } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true });

  // 総作品数
  const { count: totalCreations } = await supabase
    .from('creations')
    .select('*', { count: 'exact', head: true });

  // 平均完了率を計算
  const { data: progressData } = await supabase
    .from('user_progress')
    .select('progress_percentage');

  const averageCompletionRate =
    progressData && progressData.length > 0
      ? progressData.reduce((acc, p) => acc + (p.progress_percentage || 0), 0) / progressData.length
      : 0;

  return {
    totalUsers: totalUsers || 0,
    activeUsers: activeUsers || 0,
    totalCourses: totalCourses || 0,
    totalLessons: totalLessons || 0,
    totalCreations: totalCreations || 0,
    averageCompletionRate: Math.round(averageCompletionRate),
  };
};

export const getCourseStats = async (): Promise<CourseStats[]> => {
  const { data: courses, error } = await supabase
    .from('courses')
    .select('id, title')
    .eq('is_published', true);

  if (error || !courses) {
    console.error('Error fetching courses:', error);
    return [];
  }

  const courseStats = await Promise.all(
    courses.map(async (course) => {
      // コースのレッスン数
      const { count: totalLessons } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', course.id);

      // コースに登録したユーザー数（進捗があるユーザー）
      const { data: enrolledUsersData } = await supabase
        .from('user_progress')
        .select('user_id')
        .in(
          'lesson_id',
          (
            await supabase
              .from('lessons')
              .select('id')
              .eq('course_id', course.id)
          ).data?.map((l) => l.id) || []
        );

      const uniqueUsers = new Set(enrolledUsersData?.map((e) => e.user_id) || []);
      const enrolledUsers = uniqueUsers.size;

      // 完了率の計算
      const { data: completedData } = await supabase
        .from('user_progress')
        .select('user_id, lesson_id')
        .eq('status', 'completed')
        .in(
          'lesson_id',
          (
            await supabase
              .from('lessons')
              .select('id')
              .eq('course_id', course.id)
          ).data?.map((l) => l.id) || []
        );

      const completedLessons = completedData?.length || 0;
      const totalPossibleCompletions = enrolledUsers * (totalLessons || 1);
      const completionRate =
        totalPossibleCompletions > 0 ? (completedLessons / totalPossibleCompletions) * 100 : 0;

      // 平均進捗率
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('progress_percentage')
        .in(
          'lesson_id',
          (
            await supabase
              .from('lessons')
              .select('id')
              .eq('course_id', course.id)
          ).data?.map((l) => l.id) || []
        );

      const averageProgress =
        progressData && progressData.length > 0
          ? progressData.reduce((acc, p) => acc + (p.progress_percentage || 0), 0) /
          progressData.length
          : 0;

      return {
        id: course.id,
        title: course.title,
        enrolledUsers,
        completionRate: Math.round(completionRate),
        averageProgress: Math.round(averageProgress),
        totalLessons: totalLessons || 0,
      };
    })
  );

  return courseStats.sort((a, b) => b.enrolledUsers - a.enrolledUsers);
};

export const getUserActivityData = async (days: number = 30): Promise<UserActivityData[]> => {
  const result: UserActivityData[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    const nextDateString = nextDate.toISOString().split('T')[0];

    // その日に登録したユーザー数
    const { count: newUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', dateString)
      .lt('created_at', nextDateString);

    // その日にアクティブだったユーザー数
    const { data: activeUsersData } = await supabase
      .from('user_progress')
      .select('user_id')
      .gte('last_accessed_at', dateString)
      .lt('last_accessed_at', nextDateString);

    const uniqueActiveUsers = new Set(activeUsersData?.map((u) => u.user_id) || []);

    result.push({
      date: dateString,
      newUsers: newUsers || 0,
      activeUsers: uniqueActiveUsers.size,
    });
  }

  return result;
};

import { supabaseAdmin } from './supabaseService';
import { Course, Level, Lesson, Quiz } from '../types/index';

// ====================================
// Course Management
// ====================================

export const getAllCourses = async (): Promise<Course[]> => {
  const { data, error } = await supabaseAdmin
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
  const { data, error } = await supabaseAdmin
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
  const { data, error } = await supabaseAdmin
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
  const { data, error } = await supabaseAdmin
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
  const { error } = await supabaseAdmin
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

  const { error } = await supabaseAdmin
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
  const { data, error } = await supabaseAdmin
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
  const { data, error } = await supabaseAdmin
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
  const { data, error } = await supabaseAdmin
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
  const { data, error } = await supabaseAdmin
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
  const { error } = await supabaseAdmin
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

  const { error } = await supabaseAdmin
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
  const { data, error } = await supabaseAdmin
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
  const { data, error } = await supabaseAdmin
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
  const { data, error } = await supabaseAdmin
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
  const { data, error } = await supabaseAdmin
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
  const { data, error } = await supabaseAdmin
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
  const { error } = await supabaseAdmin
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

  const { error } = await supabaseAdmin
    .from('lessons')
    .upsert(updates);

  if (error) {
    console.error('Error updating lesson order:', error);
    throw new Error(error.message);
  }
};

// ====================================
// Quiz Management
// ====================================

export const getQuizzesByLessonId = async (lessonId: string): Promise<Quiz[]> => {
  const { data, error } = await supabaseAdmin
    .from('quizzes')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching quizzes:', error);
    throw new Error(error.message);
  }

  return data || [];
};

export const getQuizById = async (id: string): Promise<Quiz | null> => {
  const { data, error } = await supabaseAdmin
    .from('quizzes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching quiz:', error);
    throw new Error(error.message);
  }

  return data;
};

export const createQuiz = async (quiz: Omit<Quiz, 'id' | 'created_at'>): Promise<Quiz> => {
  const { data, error } = await supabaseAdmin
    .from('quizzes')
    .insert([quiz])
    .select()
    .single();

  if (error) {
    console.error('Error creating quiz:', error);
    throw new Error(error.message);
  }

  return data;
};

export const updateQuiz = async (id: string, updates: Partial<Quiz>): Promise<Quiz> => {
  const { data, error } = await supabaseAdmin
    .from('quizzes')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating quiz:', error);
    throw new Error(error.message);
  }

  return data;
};

export const deleteQuiz = async (id: string): Promise<void> => {
  const { error } = await supabaseAdmin
    .from('quizzes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting quiz:', error);
    throw new Error(error.message);
  }
};

export const updateQuizOrder = async (quizIds: string[]): Promise<void> => {
  const updates = quizIds.map((id, index) => ({
    id,
    order_index: index
  }));

  const { error } = await supabaseAdmin
    .from('quizzes')
    .upsert(updates);

  if (error) {
    console.error('Error updating quiz order:', error);
    throw new Error(error.message);
  }
};

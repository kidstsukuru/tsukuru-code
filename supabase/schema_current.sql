-- ============================================
-- Current Database Schema
-- Generated: 2025-12-09
-- Description: Complete schema after cleanup (6 tables)
-- ============================================


-- ============================================
-- Table: badge_templates
-- ============================================

CREATE TABLE badge_templates (id TEXT NOT NULL, name TEXT NOT NULL, description TEXT, icon TEXT NOT NULL, category TEXT, condition_type TEXT, condition_value INTEGER, xp_reward INTEGER DEFAULT 0, order_index INTEGER DEFAULT 0, created_at TIMESTAMP WITH TIME ZONE DEFAULT now());

-- Constraints
ALTER TABLE badge_templates ADD CONSTRAINT badge_templates_pkey PRIMARY KEY (id);

-- Enable RLS
ALTER TABLE badge_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view badge templates" ON badge_templates FOR SELECT USING (true);


-- ============================================
-- Table: courses
-- ============================================

CREATE TABLE courses (id TEXT NOT NULL, title TEXT NOT NULL, description TEXT, icon TEXT, difficulty TEXT, estimated_hours INTEGER, is_published BOOLEAN DEFAULT false, order_index INTEGER DEFAULT 0, created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT now());

-- Constraints
ALTER TABLE courses ADD CONSTRAINT courses_pkey PRIMARY KEY (id);

-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can delete courses" ON courses FOR DELETE USING ((( SELECT (users.raw_user_meta_data ->> 'role'::text)
   FROM auth.users
  WHERE (users.id = auth.uid())) = 'super_admin'::text));
CREATE POLICY "Admins can insert courses" ON courses FOR INSERT WITH CHECK ((( SELECT (users.raw_user_meta_data ->> 'role'::text)
   FROM auth.users
  WHERE (users.id = auth.uid())) = ANY (ARRAY['admin'::text, 'super_admin'::text])));
CREATE POLICY "Admins can update courses" ON courses FOR UPDATE USING ((( SELECT (users.raw_user_meta_data ->> 'role'::text)
   FROM auth.users
  WHERE (users.id = auth.uid())) = ANY (ARRAY['admin'::text, 'super_admin'::text])));
CREATE POLICY "Admins can view all courses" ON courses FOR SELECT USING ((( SELECT (users.raw_user_meta_data ->> 'role'::text)
   FROM auth.users
  WHERE (users.id = auth.uid())) = ANY (ARRAY['admin'::text, 'super_admin'::text])));
CREATE POLICY "Anyone can view published courses" ON courses FOR SELECT USING ((is_published = true));


-- ============================================
-- Table: lessons
-- ============================================

CREATE TABLE lessons (id TEXT NOT NULL, course_id TEXT NOT NULL, title TEXT NOT NULL, description TEXT, content JSONB, order_index INTEGER DEFAULT 0, xp_reward INTEGER DEFAULT 10, is_published BOOLEAN DEFAULT false, created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(), youtube_url TEXT, duration_minutes INTEGER DEFAULT 15);

-- Constraints
ALTER TABLE lessons ADD CONSTRAINT lessons_course_id_fkey FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
ALTER TABLE lessons ADD CONSTRAINT lessons_pkey PRIMARY KEY (id);

-- Indexes
CREATE INDEX idx_lessons_course_id ON public.lessons USING btree (course_id);
CREATE INDEX idx_lessons_published ON public.lessons USING btree (is_published, order_index);

-- Enable RLS
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can delete lessons" ON lessons FOR DELETE USING ((( SELECT (users.raw_user_meta_data ->> 'role'::text)
   FROM auth.users
  WHERE (users.id = auth.uid())) = ANY (ARRAY['admin'::text, 'super_admin'::text])));
CREATE POLICY "Admins can insert lessons" ON lessons FOR INSERT WITH CHECK ((( SELECT (users.raw_user_meta_data ->> 'role'::text)
   FROM auth.users
  WHERE (users.id = auth.uid())) = ANY (ARRAY['admin'::text, 'super_admin'::text])));
CREATE POLICY "Admins can update lessons" ON lessons FOR UPDATE USING ((( SELECT (users.raw_user_meta_data ->> 'role'::text)
   FROM auth.users
  WHERE (users.id = auth.uid())) = ANY (ARRAY['admin'::text, 'super_admin'::text])));
CREATE POLICY "Admins can view all lessons" ON lessons FOR SELECT USING ((( SELECT (users.raw_user_meta_data ->> 'role'::text)
   FROM auth.users
  WHERE (users.id = auth.uid())) = ANY (ARRAY['admin'::text, 'super_admin'::text])));
CREATE POLICY "Anyone can view published lessons" ON lessons FOR SELECT USING ((is_published = true));


-- ============================================
-- Table: user_badges
-- ============================================

CREATE TABLE user_badges (id UUID NOT NULL DEFAULT gen_random_uuid(), user_id UUID NOT NULL, badge_id TEXT NOT NULL, acquired_at TIMESTAMP WITH TIME ZONE DEFAULT now());

-- Constraints
ALTER TABLE user_badges ADD CONSTRAINT user_badges_badge_id_fkey FOREIGN KEY (badge_id) REFERENCES badge_templates(id) ON DELETE CASCADE;
null
ALTER TABLE user_badges ADD CONSTRAINT user_badges_pkey PRIMARY KEY (id);
ALTER TABLE user_badges ADD CONSTRAINT user_badges_user_id_badge_id_key UNIQUE;
ALTER TABLE user_badges ADD CONSTRAINT user_badges_user_id_badge_id_key UNIQUE;
ALTER TABLE user_badges ADD CONSTRAINT user_badges_user_id_badge_id_key UNIQUE;
ALTER TABLE user_badges ADD CONSTRAINT user_badges_user_id_badge_id_key UNIQUE;

-- Indexes
CREATE INDEX idx_user_badges_user_id ON public.user_badges USING btree (user_id);
CREATE UNIQUE INDEX user_badges_user_id_badge_id_key ON public.user_badges USING btree (user_id, badge_id);

-- Enable RLS
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can insert own badges" ON user_badges FOR INSERT WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can view own badges" ON user_badges FOR SELECT USING ((auth.uid() = user_id));


-- ============================================
-- Table: user_progress
-- ============================================

CREATE TABLE user_progress (id UUID NOT NULL DEFAULT gen_random_uuid(), user_id UUID NOT NULL, lesson_id TEXT NOT NULL, course_id TEXT NOT NULL, completed BOOLEAN DEFAULT false, completed_at TIMESTAMP WITH TIME ZONE, score INTEGER, attempts INTEGER DEFAULT 0, time_spent INTEGER DEFAULT 0, created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT now());

-- Constraints
ALTER TABLE user_progress ADD CONSTRAINT user_progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE;
null
ALTER TABLE user_progress ADD CONSTRAINT user_progress_course_id_fkey FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
ALTER TABLE user_progress ADD CONSTRAINT user_progress_pkey PRIMARY KEY (id);
ALTER TABLE user_progress ADD CONSTRAINT user_progress_user_id_lesson_id_key UNIQUE;
ALTER TABLE user_progress ADD CONSTRAINT user_progress_user_id_lesson_id_key UNIQUE;
ALTER TABLE user_progress ADD CONSTRAINT user_progress_user_id_lesson_id_key UNIQUE;
ALTER TABLE user_progress ADD CONSTRAINT user_progress_user_id_lesson_id_key UNIQUE;

-- Indexes
CREATE INDEX idx_user_progress_completed ON public.user_progress USING btree (user_id, completed);
CREATE INDEX idx_user_progress_user_course ON public.user_progress USING btree (user_id, course_id);
CREATE INDEX idx_user_progress_user_id ON public.user_progress USING btree (user_id);
CREATE UNIQUE INDEX user_progress_user_id_lesson_id_key ON public.user_progress USING btree (user_id, lesson_id);

-- Enable RLS
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view all progress" ON user_progress FOR SELECT USING ((( SELECT (users.raw_user_meta_data ->> 'role'::text)
   FROM auth.users
  WHERE (users.id = auth.uid())) = ANY (ARRAY['admin'::text, 'super_admin'::text])));
CREATE POLICY "Users can insert own progress" ON user_progress FOR INSERT WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can update own progress" ON user_progress FOR UPDATE USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can view own progress" ON user_progress FOR SELECT USING ((auth.uid() = user_id));


-- ============================================
-- Table: users
-- ============================================

CREATE TABLE users (id UUID NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL, login_streak INTEGER DEFAULT 1, xp INTEGER DEFAULT 0, level INTEGER DEFAULT 1, created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(), role TEXT DEFAULT 'student'::text);

-- Constraints
null
ALTER TABLE users ADD CONSTRAINT users_pkey PRIMARY KEY (id);
ALTER TABLE users ADD CONSTRAINT users_pkey PRIMARY KEY (id);
ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE;

-- Indexes
CREATE INDEX idx_users_role ON public.users USING btree (role);
CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view all users" ON users FOR SELECT USING (public.is_admin());
CREATE POLICY "Super admins can update any user" ON users FOR UPDATE USING (public.is_super_admin());
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK ((auth.uid() = id));
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING ((auth.uid() = id)) WITH CHECK (((auth.uid() = id) AND (role = public.get_my_role())));
CREATE POLICY "Users can view own data" ON users FOR SELECT USING ((auth.uid() = id));


-- ============================================
-- Functions
-- ============================================

CREATE OR REPLACE FUNCTION public.get_my_role()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM users
  WHERE id = auth.uid();

  RETURN user_role;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM users
  WHERE id = auth.uid();

  RETURN user_role IN ('admin', 'super_admin');
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_super_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM users
  WHERE id = auth.uid();

  RETURN user_role = 'super_admin';
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

-- ============================================
-- Triggers
-- ============================================

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE FUNCTION EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress FOR EACH ROW EXECUTE FUNCTION EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION EXECUTE FUNCTION public.update_updated_at_column();

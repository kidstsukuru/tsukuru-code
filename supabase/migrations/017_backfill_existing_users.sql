-- 既存のauth.usersに存在するがpublic.usersに存在しないユーザーをバックフィル

INSERT INTO public.users (id, name, email, login_streak, xp, level, role, created_at)
SELECT
  au.id,
  COALESCE(au.raw_user_meta_data->>'name', 'ユーザー') as name,
  au.email,
  1 as login_streak,
  0 as xp,
  1 as level,
  'student' as role,
  au.created_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO NOTHING;

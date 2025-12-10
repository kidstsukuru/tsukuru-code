import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import PageTransition from '../components/animations/PageTransition';
import { useAuthStore } from '../store/authStore';
import { loginSchema, type LoginFormData } from '../schemas/authSchemas';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loading, isAuthenticated } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur', // バリデーションをフォーカスが外れた時に実行
  });

  // Automatic redirect after successful login
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleRegisterClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate('/register');
  };

  const onSubmit = (data: LoginFormData) => {
    login(data.email, data.password);
  };

  return (
    <PageTransition>
      <div className="flex justify-center items-center py-20">
          <Card>
              <div className="p-8 w-96">
                  <h2 className="text-2xl font-bold text-center mb-6">ログイン</h2>
                  <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                      <Input
                        label="メールアドレス"
                        type="email"
                        placeholder="email@example.com"
                        error={errors.email?.message}
                        {...register('email')}
                      />
                      <Input
                        label="パスワード"
                        type="password"
                        placeholder="********"
                        error={errors.password?.message}
                        {...register('password')}
                      />
                      <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                          {loading ? 'ログイン中...' : 'ログインする'}
                      </Button>
                  </form>
                  <p className="text-center mt-4 text-sm text-gray-600">
                      アカウントがまだない？ <a href="#" onClick={handleRegisterClick} className="text-amber-500 hover:underline">新規登録</a>
                  </p>
              </div>
          </Card>
      </div>
    </PageTransition>
  );
};

export default LoginPage;
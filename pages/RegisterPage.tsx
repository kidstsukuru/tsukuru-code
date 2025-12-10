import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import PageTransition from '../components/animations/PageTransition';
import { useAuthStore } from '../store/authStore';
import { registerSchema, type RegisterFormData } from '../schemas/authSchemas';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser, loading, isAuthenticated } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur', // バリデーションをフォーカスが外れた時に実行
  });

  // Automatic redirect after successful registration
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleLoginClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate('/login');
  };

  const onSubmit = (data: RegisterFormData) => {
    registerUser(data.name, data.email, data.password);
  };

  return (
    <PageTransition>
      <div className="flex justify-center items-center py-20">
          <Card>
              <div className="p-8 w-96">
                  <h2 className="text-2xl font-bold text-center mb-6">新規登録</h2>
                  <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                      <Input
                        label="なまえ"
                        type="text"
                        placeholder="たろう"
                        error={errors.name?.message}
                        {...register('name')}
                      />
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
                      <Input
                        label="パスワード（かくにん）"
                        type="password"
                        placeholder="********"
                        error={errors.confirmPassword?.message}
                        {...register('confirmPassword')}
                      />
                      <Button type="submit" variant="primary" className="w-full !mt-6" disabled={loading}>
                          {loading ? '登録中...' : '登録して冒険をはじめる！'}
                      </Button>
                  </form>
                  <p className="text-center mt-4 text-sm text-gray-600">
                      アカウントはもうある？ <a href="#" onClick={handleLoginClick} className="text-amber-500 hover:underline">ログイン</a>
                  </p>
              </div>
          </Card>
      </div>
    </PageTransition>
  );
};

export default RegisterPage;
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getPublishedCourses } from '../services/supabaseService';
import { Course } from '../types/index';
import Card from '../components/common/Card';
import StatCard from '../components/dashboard/StatCard';
import BadgeIcon from '../components/dashboard/BadgeIcon';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Supabaseから公開コースを取得
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await getPublishedCourses();
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast.error('コースの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-amber-600">
            おかえりなさい、
            <br className="sm:hidden" />
            {user.name}さん！
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-600">
            今日もプログラミングの世界を
            <br className="sm:hidden" />
            冒険しよう！
          </p>
        </div>

        {/* 管理者ボタン */}
        {isAdmin && (
          <Button
            variant="secondary"
            onClick={() => navigate('/admin')}
            className="hidden sm:flex items-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>管理画面</span>
          </Button>
        )}
      </div>

      {/* Stats Section */}
      <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <StatCard icon="🔥" value={user.loginStreak} label="日連続ログイン" color="yellow" />
        <StatCard icon="✨" value={user.xp} label="けいけんち (XP)" color="yellow" />
        <StatCard icon="🚀" value={`レベル ${user.level}`} label="現在のレベル" color="amber" />
        <StatCard icon="🏆" value={user.badges.filter(b => b.acquired).length} label="このバッジ" color="indigo" />
      </div>

      <div className="mt-12 grid lg:grid-cols-3 gap-8">
        {/* Main Content: Courses */}
        <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">学習をつづける</h2>

            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">読み込み中...</p>
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">公開されているコースがありません</p>
                {isAdmin && (
                  <Button
                    variant="primary"
                    className="mt-4"
                    onClick={() => navigate('/admin/courses')}
                  >
                    コースを作成する
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {courses.map((course) => (
                  <Card key={course.id} className="p-0 flex flex-col">
                    <div className='p-6 flex-grow'>
                      <div className="flex items-center gap-3 mb-3">
                        {course.icon && <span className="text-3xl">{course.icon}</span>}
                        <h3 className="text-xl font-bold">{course.title}</h3>
                      </div>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {course.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {course.estimated_hours && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            約{course.estimated_hours}時間
                          </span>
                        )}
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs">
                          {course.difficulty === 'beginner' ? '初級' : course.difficulty === 'intermediate' ? '中級' : '上級'}
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-b-xl">
                      <Button variant="primary" className="w-full" onClick={() => navigate(`/course/${course.id}`)}>
                        学習する
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
        </div>

        {/* Sidebar: Badges */}
        <div>
            <h2 className="text-2xl font-bold mb-6">くんしょう</h2>
            <Card className="p-6">
                <div className="grid grid-cols-3 gap-4">
                    {user.badges.map(badge => (
                        <BadgeIcon key={badge.id} badge={badge} />
                    ))}
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getPublishedCourses } from '../services/supabaseService';
import { Course } from '../types/index';
import Card from '../components/common/Card';
import StatCard from '../components/dashboard/StatCard';
import BadgeIcon from '../components/dashboard/BadgeIcon';
import Button from '../components/common/Button';
import Sidebar from '../components/dashboard/Sidebar';
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
    <div className="flex min-h-screen">
      {/* サイドバー */}
      <Sidebar />

      {/* メインコンテンツ */}
      <div className="flex-1 lg:ml-0">
        <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-amber-600 leading-tight">
              おかえりなさい、
              <br className="sm:hidden" />
              {user.name}さん！
            </h1>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-gray-600 leading-relaxed">
              今日もプログラミングの世界を
              <br className="sm:hidden" />
              冒険しよう！
            </p>
          </div>

      {/* Stats Section */}
      <div className="mt-6 sm:mt-8 lg:mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <StatCard icon="🔥" value={user.loginStreak} label="日連続ログイン" color="yellow" />
        <StatCard icon="✨" value={user.xp} label="けいけんち (XP)" color="yellow" />
        <StatCard icon="🚀" value={`レベル ${user.level}`} label="現在のレベル" color="amber" />
        <StatCard icon="🏆" value={user.badges.filter(b => b.acquired).length} label="このバッジ" color="indigo" />
      </div>

      <div className="mt-8 sm:mt-10 lg:mt-12 grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Main Content: Courses */}
        <div className="lg:col-span-2">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 leading-tight">学習をつづける</h2>

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
              <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                {courses.map((course) => (
                  <Card key={course.id} className="p-0 flex flex-col">
                    <div className='p-4 sm:p-6 flex-grow'>
                      <div className="flex items-center gap-2 sm:gap-3 mb-3">
                        {course.icon && <span className="text-2xl sm:text-3xl">{course.icon}</span>}
                        <h3 className="text-lg sm:text-xl font-bold leading-tight">{course.title}</h3>
                      </div>
                      <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>
                      <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
                        {course.estimated_hours && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            約{course.estimated_hours}時間
                          </span>
                        )}
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                          {course.difficulty === 'beginner' ? '初級' : course.difficulty === 'intermediate' ? '中級' : '上級'}
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-b-xl">
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
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 leading-tight">くんしょう</h2>
            <Card className="p-4 sm:p-6">
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                    {user.badges.map(badge => (
                        <BadgeIcon key={badge.id} badge={badge} />
                    ))}
                </div>
            </Card>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
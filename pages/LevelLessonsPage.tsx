import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getCourseById, getLevelById, getLessonsByLevel, getUserProgress } from '../services/supabaseService';
import { useAuthStore } from '../store/authStore';
import { Course, Level, Lesson, UserProgress } from '../types/index';
import StageNode from '../components/adventure/StageNode';


interface LessonWithProgress extends Lesson {
  isUnlocked: boolean;
  isCompleted: boolean;
  progress?: UserProgress;
}

const LevelLessonsPage: React.FC = () => {
  const navigate = useNavigate();
  const { courseId, levelId } = useParams<{ courseId: string; levelId: string }>();
  const { user } = useAuthStore();
  const [course, setCourse] = useState<Course | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [lessons, setLessons] = useState<LessonWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  // マップの座標を生成する関数
  const generateMapPoints = (count: number) => {
    return Array.from({ length: count }).map((_, i) => {
      // サイン波で曲がりくねった道を作る
      const x = 50 + 30 * Math.sin(i * 0.8);
      const y = 10 + (i * 15); // 縦方向の間隔
      return { x, y };
    });
  };

  const mapPoints = React.useMemo(() => generateMapPoints(lessons.length), [lessons.length]);

  // 現在のプレイヤー位置（最後にアンロックされた、またはプレイ中のレッスン）
  const activeLessonIndex = lessons.reduce((acc, lesson, index) => {
    if (lesson.isUnlocked && !lesson.isCompleted) return index;
    if (lesson.isCompleted) return index; // 全て完了なら最後
    return acc;
  }, 0);

  useEffect(() => {
    if (courseId && levelId && user) {
      loadData();
    }
  }, [courseId, levelId, user]);

  const loadData = async () => {
    if (!courseId || !levelId || !user) return;

    try {
      setLoading(true);

      const [courseData, levelData, lessonsData, userProgressData] = await Promise.all([
        getCourseById(courseId),
        getLevelById(levelId),
        getLessonsByLevel(levelId),
        getUserProgress(user.uid),
      ]);

      setCourse(courseData);
      setLevel(levelData);

      const lessonsWithProgress: LessonWithProgress[] = lessonsData.map((lesson, index) => {
        const progress = userProgressData.find(p => p.lesson_id === lesson.id);

        // 最初のレッスンは常にアンロック、それ以降は前のレッスンが完了していればアンロック
        const isUnlocked = index === 0 ||
          (userProgressData.some(p =>
            p.lesson_id === lessonsData[index - 1]?.id && p.completed
          ));

        return {
          ...lesson,
          isUnlocked,
          isCompleted: progress?.completed || false,
          progress,
        };
      });

      setLessons(lessonsWithProgress);
    } catch (error) {
      console.error('Error loading level lessons:', error);
      toast.error('データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleLessonClick = (lesson: LessonWithProgress) => {
    if (!lesson.isUnlocked) {
      toast.error('前のレッスンを完了してください');
      return;
    }

    navigate(`/course/${courseId}/level/${levelId}/lesson/${lesson.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-amber-50">
        <div className="text-xl text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (!course || !level) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-amber-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">レベルが見つかりません</p>
          <button
            onClick={() => navigate(`/course/${courseId}`)}
            className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
          >
            レベル一覧に戻る
          </button>
        </div>
      </div>
    );
  }





  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-100">
        <div className="text-xl text-stone-600 font-serif">冒険の準備中...</div>
      </div>
    );
  }

  if (!course || !level) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-100">
        <div className="text-center">
          <p className="text-stone-600 mb-4">地図が見つかりません</p>
          <button
            onClick={() => navigate(`/course/${courseId}`)}
            className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-bold shadow-md"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  const completedCount = lessons.filter(l => l.isCompleted).length;
  const progressPercentage = lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#e6d5ac] relative overflow-hidden font-sans">
      {/* 背景装飾（地図のようなテクスチャ感） */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      {/* ヘッダーエリア */}
      <div className="relative z-20 pt-6 px-4 mb-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(`/course/${courseId}`)}
            className="flex items-center text-stone-700 hover:text-stone-900 bg-white/80 px-4 py-2 rounded-full shadow-sm backdrop-blur-sm transition-all hover:bg-white"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-bold">ワールドマップへ</span>
          </button>

          <div className="bg-white/90 px-6 py-3 rounded-xl shadow-lg border-2 border-amber-200 backdrop-blur-sm">
            <h1 className="text-2xl font-bold text-amber-800">{level.title}</h1>
            <div className="flex items-center mt-1 gap-2">
              <div className="flex-1 h-3 bg-stone-200 rounded-full overflow-hidden w-32">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-green-600"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="text-xs font-bold text-stone-600">{completedCount}/{lessons.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* マップエリア */}
      <div className="relative max-w-2xl mx-auto h-[800px] overflow-y-auto pb-20 scrollbar-hide">
        <div className="relative w-full h-[1200px]"> {/* スクロール可能な高さ */}

          {/* 道を描画 */}
          {/* Note: MapPath expects absolute coordinates or we adjust the component. 
             Let's assume MapPath takes percentages or we adjust the scaling here.
             The previous MapPath implementation used raw coordinates for SVG path.
             Let's adjust the props passed to MapPath to match the visual scaling.
             Actually, let's just pass the raw points and let MapPath handle it or style it.
             Wait, MapPath implementation took points and made a path string.
             If I pass {x: 50, y: 10}, SVG path is "M 50 10 ...".
             If the SVG is 100% width/height, these are small pixels.
             I need to scale them to the container size or use percentages.
             Let's use percentages in MapPath by setting viewBox="0 0 100 100" and preserveAspectRatio="none"?
             No, that distorts the line thickness.
             Better to use a fixed coordinate system or pass pixel values.
             Let's assume the container is roughly 600px wide.
             x: 0-100 -> 0-600px.
             y: 0-100 -> 0-1200px (based on height).
          */}

          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path
              d={mapPoints.map((p, i) =>
                `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
              ).join(' ')}
              fill="none"
              stroke="rgba(255, 255, 255, 0.6)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={mapPoints.map((p, i) =>
                `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
              ).join(' ')}
              fill="none"
              stroke="#d97706"
              strokeWidth="0.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="2 2"
              className="animate-pulse"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* ノードを描画 */}
          {lessons.map((lesson, index) => (
            <StageNode
              key={lesson.id}
              x={mapPoints[index].x}
              y={mapPoints[index].y}
              index={index}
              title={lesson.title}
              isUnlocked={lesson.isUnlocked}
              isCompleted={lesson.isCompleted}
              isActive={index === activeLessonIndex}
              onClick={() => handleLessonClick(lesson)}
            />
          ))}
        </div>
      </div>
    </div >
  );
};

export default LevelLessonsPage;

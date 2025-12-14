import React from 'react';

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  className?: string;
  count?: number;
}

const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
  count = 1,
}) => {
  const baseClasses = 'animate-pulse bg-gray-300';

  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 rounded';
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded-lg';
      case 'card':
        return 'rounded-xl';
      default:
        return '';
    }
  };

  const style = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'circular' ? width : undefined),
  };

  const skeletonElement = (
    <div
      className={`${baseClasses} ${getVariantClasses()} ${className}`}
      style={style}
    />
  );

  if (count === 1) {
    return skeletonElement;
  }

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="mb-2">
          {skeletonElement}
        </div>
      ))}
    </>
  );
};

// プリセットコンポーネント
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white rounded-xl p-6 shadow ${className}`}>
    <Skeleton variant="rectangular" height={200} className="mb-4" />
    <Skeleton variant="text" width="80%" className="mb-2" />
    <Skeleton variant="text" width="60%" />
  </div>
);

export const CourseSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl p-6 shadow-lg">
    <div className="flex items-center gap-4 mb-4">
      <Skeleton variant="circular" width={64} height={64} />
      <div className="flex-1">
        <Skeleton variant="text" width="70%" className="mb-2" />
        <Skeleton variant="text" width="40%" />
      </div>
    </div>
    <Skeleton variant="rectangular" height={100} />
  </div>
);

export const CreationCardSkeleton: React.FC = () => (
  <div className="text-center">
    <Skeleton variant="rectangular" width="100%" className="aspect-square rounded-2xl mb-3" />
    <Skeleton variant="text" width="80%" className="mb-1" />
    <Skeleton variant="text" width="60%" />
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="container mx-auto px-6 py-8">
    {/* ヘッダー */}
    <div className="mb-8">
      <Skeleton variant="text" width={300} height={40} className="mb-4" />
      <Skeleton variant="text" width={200} />
    </div>

    {/* ステータスカード */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl p-6 shadow">
          <Skeleton variant="text" width="60%" className="mb-4" />
          <Skeleton variant="text" width="40%" height={32} />
        </div>
      ))}
    </div>

    {/* コース一覧 */}
    <div className="space-y-4">
      <Skeleton variant="text" width={200} height={32} className="mb-6" />
      {[1, 2, 3].map((i) => (
        <CourseSkeleton key={i} />
      ))}
    </div>
  </div>
);

export default Skeleton;

import React from 'react';
import { AppBadge } from '../../types/index';

type BadgeIconProps = {
  badge: AppBadge;
};

const BadgeIcon: React.FC<BadgeIconProps> = ({ badge }) => {
  return (
    <div className="flex flex-col items-center text-center group">
      <div className={`text-4xl transition-all duration-300 ${!badge.acquired && 'grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100'}`}>
        {badge.icon}
      </div>
      <p className={`mt-1 text-xs font-bold ${badge.acquired ? 'text-gray-700' : 'text-gray-400'}`}>
        {badge.name}
      </p>
    </div>
  );
};

export default BadgeIcon;
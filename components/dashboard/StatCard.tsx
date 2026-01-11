import React from 'react';
import Card from '../common/Card';

type StatCardProps = {
  icon: string;
  value: string | number;
  label: string;
  color: 'yellow' | 'amber' | 'indigo';
};

const colorVariants = {
  yellow: 'bg-yellow-100 text-yellow-600',
  amber: 'bg-amber-100 text-amber-600',
  indigo: 'bg-indigo-100 text-indigo-600',
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, color }) => {
  return (
    <Card className="p-4 landscape:p-2 flex flex-col items-center justify-center text-center">
      <div className={`text-3xl landscape:text-xl ${colorVariants[color]} rounded-full w-14 h-14 landscape:w-10 landscape:h-10 flex items-center justify-center mb-2 landscape:mb-1`}>
        {icon}
      </div>
      <p className="text-2xl landscape:text-lg font-extrabold text-gray-800">{value}</p>
      <p className="text-sm landscape:text-xs text-gray-500 font-bold">{label}</p>
    </Card>
  );
};

export default StatCard;
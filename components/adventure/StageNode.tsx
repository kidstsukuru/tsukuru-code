import React from 'react';
import { motion } from 'framer-motion';

interface StageNodeProps {
    x: number;
    y: number;
    index: number;
    title: string;
    isUnlocked: boolean;
    isCompleted: boolean;
    isActive?: boolean;
    onClick: () => void;
}

const StageNode: React.FC<StageNodeProps> = ({
    x,
    y,
    index,
    title,
    isUnlocked,
    isCompleted,
    isActive,
    onClick,
}) => {
    return (
        <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center"
            style={{ left: `${x}%`, top: `${y}%` }}
        >
            <motion.button
                whileHover={isUnlocked ? { scale: 1.1 } : {}}
                whileTap={isUnlocked ? { scale: 0.95 } : {}}
                onClick={onClick}
                className={`
          relative w-16 h-16 rounded-full flex items-center justify-center
          border-4 shadow-lg transition-colors duration-300
          ${isCompleted
                        ? 'bg-green-500 border-green-600 text-white'
                        : isUnlocked
                            ? 'bg-amber-400 border-amber-500 text-white'
                            : 'bg-gray-400 border-gray-500 text-gray-200'
                    }
          ${isActive ? 'ring-4 ring-blue-400 ring-offset-2' : ''}
        `}
                disabled={!isUnlocked}
            >
                {isCompleted ? (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                ) : !isUnlocked ? (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                ) : (
                    <span className="text-2xl font-bold">{index + 1}</span>
                )}

                {/* Active Indicator (Player Avatar Placeholder) */}
                {isActive && (
                    <motion.div
                        initial={{ y: -10 }}
                        animate={{ y: -20 }}
                        transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.6 }}
                        className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                    >
                        <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-blue-500" />
                    </motion.div>
                )}
            </motion.button>

            {/* Title Label */}
            <div className={`
        mt-2 px-3 py-1 rounded-full text-xs font-bold shadow-md whitespace-nowrap max-w-[150px] truncate
        ${isUnlocked ? 'bg-white text-gray-800' : 'bg-gray-200 text-gray-500'}
      `}>
                {title}
            </div>
        </div>
    );
};

export default StageNode;

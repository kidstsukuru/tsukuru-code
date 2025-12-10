import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type BadgeAnimationProps = {
  isVisible: boolean;
  badgeName: string;
  badgeIcon: string;
  onClose: () => void;
};

const BadgeAnimation: React.FC<BadgeAnimationProps> = ({
  isVisible,
  badgeName,
  badgeIcon,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 20,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className="text-8xl mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {badgeIcon}
            </motion.div>

            <motion.h2
              className="text-3xl font-bold text-amber-600 mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              バッジ獲得！
            </motion.h2>

            <motion.p
              className="text-xl text-gray-700 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {badgeName}
            </motion.p>

            {/* 紙吹雪エフェクト */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: '-10px',
                    backgroundColor: ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a'][
                      Math.floor(Math.random() * 4)
                    ],
                  }}
                  initial={{ y: 0, opacity: 1 }}
                  animate={{
                    y: 600,
                    opacity: 0,
                    rotate: Math.random() * 360,
                  }}
                  transition={{
                    duration: 2 + Math.random(),
                    delay: Math.random() * 0.5,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </div>

            <motion.button
              className="mt-4 px-6 py-2 bg-amber-500 text-white rounded-lg font-bold"
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              閉じる
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BadgeAnimation;

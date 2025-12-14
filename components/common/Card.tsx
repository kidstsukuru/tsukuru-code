import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

type CardProps = Omit<HTMLMotionProps<'div'>, 'ref'> & {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
};

const Card: React.FC<CardProps> = ({ children, className = '', onClick, ...props }) => {
  const isClickable = !!onClick;

  const combinedClassName = `
    bg-white rounded-xl shadow-lg overflow-hidden
    ${isClickable ? 'cursor-pointer' : ''}
    ${className}
  `;

  return (
    <motion.div
      className={combinedClassName}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={isClickable ? { scale: 1.02, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' } : {}}
      whileTap={isClickable ? { scale: 0.98 } : {}}
      transition={{ duration: 0.2 }}
      tabIndex={isClickable ? 0 : undefined}
      role={isClickable ? 'button' : undefined}
      onKeyDown={isClickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      } : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;

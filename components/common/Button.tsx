import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

type ButtonProps = Omit<HTMLMotionProps<'button'>, 'ref'> & {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'normal' | 'large';
};

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'normal',
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'font-bold rounded-lg shadow-md focus:outline-none focus:ring-4 focus-visible:ring-4 transition-all active:scale-95';

  const variantStyles = {
    primary: 'bg-amber-500 text-white focus:ring-amber-300 focus-visible:ring-amber-400 hover:bg-amber-600 active:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed',
    secondary: 'bg-yellow-200 text-yellow-800 focus:ring-yellow-200 focus-visible:ring-yellow-300 hover:bg-yellow-300 active:bg-yellow-400 disabled:bg-gray-200 disabled:cursor-not-allowed',
  };

  // モバイルファースト: 最小タッチターゲット 44x44px を保証
  const sizeStyles = {
    small: 'py-2 px-4 text-sm min-h-[44px]',
    normal: 'py-3 px-6 text-base min-h-[48px]',
    large: 'py-4 px-8 text-lg min-h-[56px]',
  };

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  return (
    <motion.button
      className={combinedClassName}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.05, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      aria-disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;
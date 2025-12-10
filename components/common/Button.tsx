import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

type ButtonProps = Omit<HTMLMotionProps<'button'>, 'ref'> & {
  variant?: 'primary' | 'secondary';
  size?: 'normal' | 'large';
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
    'font-bold rounded-lg shadow-md focus:outline-none focus:ring-4 focus-visible:ring-4 transition-all';

  const variantStyles = {
    primary: 'bg-amber-500 text-white focus:ring-amber-300 focus-visible:ring-amber-400 hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed',
    secondary: 'bg-yellow-200 text-yellow-800 focus:ring-yellow-200 focus-visible:ring-yellow-300 hover:bg-yellow-300 disabled:bg-gray-200 disabled:cursor-not-allowed',
  };

  const sizeStyles = {
    normal: 'py-2 px-4 text-base',
    large: 'py-3 px-8 text-lg',
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
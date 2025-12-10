import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

const Input: React.FC<InputProps> = ({ label, id, className = '', error, required, ...props }) => {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 11)}`;
  const errorId = `${inputId}-error`;

  return (
    <div>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-bold text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-4 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus-visible:ring-2 ${error ? 'focus:ring-red-400 focus:border-red-400 focus-visible:ring-red-400' : 'focus:ring-amber-400 focus:border-amber-400 focus-visible:ring-amber-400'} outline-none transition-colors ${className}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : undefined}
        aria-required={required}
        required={required}
        {...props}
      />
      {error && (
        <p
          id={errorId}
          className="mt-1 text-sm text-red-600"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
import { forwardRef } from 'react';

const variantClasses = {
  default: 'bg-red-600 text-white hover:bg-red-700',
  outline: 'border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
  destructive: 'bg-red-600 text-white hover:bg-red-700',
  secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
};

const sizeClasses = {
  default: 'h-9 px-4 py-2',
  sm: 'h-8 px-3 text-xs',
  lg: 'h-11 px-6',
  icon: 'h-9 w-9',
};

const Button = forwardRef(function Button(
  { className = '', variant = 'default', size = 'default', children, ...props },
  ref
) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 cursor-pointer';

  const variantClass = variantClasses[variant] || variantClasses.default;
  const sizeClass = sizeClasses[size] || sizeClasses.default;

  return (
    <button
      ref={ref}
      className={`${base} ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

export { Button };

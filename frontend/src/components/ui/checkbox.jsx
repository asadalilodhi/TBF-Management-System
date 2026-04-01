import { forwardRef } from 'react';

const Checkbox = forwardRef(function Checkbox(
  { checked, onCheckedChange, className = '', ...props },
  ref
) {
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={!!checked}
      onChange={(e) => onCheckedChange && onCheckedChange(e.target.checked)}
      className={`w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer ${className}`}
      {...props}
    />
  );
});

export { Checkbox };
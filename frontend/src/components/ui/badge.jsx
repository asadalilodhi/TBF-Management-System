export function Badge({ children, className = '', variant = 'default' }) {
    const base = 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium';
    const variants = {
      default: 'bg-gray-900 text-white',
      outline: 'border border-gray-300 text-gray-700 bg-transparent',
      secondary: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`${base} ${variants[variant] || variants.default} ${className}`}>
        {children}
      </span>
    );
  }
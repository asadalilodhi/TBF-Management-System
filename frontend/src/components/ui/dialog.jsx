import { useEffect } from 'react';

// Dialog root - controls open state
export function Dialog({ open, onOpenChange, children }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && open) onOpenChange(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={() => onOpenChange(false)}
      />
      {/* Panel */}
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}

export function DialogContent({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl shadow-2xl p-6 mx-4 ${className}`}>
      {children}
    </div>
  );
}

export function DialogHeader({ children }) {
  return <div className="mb-4">{children}</div>;
}

export function DialogTitle({ children }) {
  return <h2 className="text-lg font-semibold text-gray-900">{children}</h2>;
}

export function DialogDescription({ children }) {
  return <p className="text-sm text-gray-500 mt-1">{children}</p>;
}

export function DialogFooter({ children, className = '' }) {
  return (
    <div className={`flex justify-end gap-3 mt-6 ${className}`}>{children}</div>
  );
}

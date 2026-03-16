import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, title, description) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-80">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onClose={() =>
            setToasts(prev => prev.filter(x => x.id !== t.id))
          } />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }) {
  const colors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-gray-700',
    warning: 'bg-yellow-500',
  };

  return (
    <div className={`${colors[toast.type] || colors.info} text-white rounded-lg px-4 py-3 shadow-lg flex justify-between items-start`}>
      <div>
        <p className="font-semibold text-sm">{toast.title}</p>
        {toast.description && (
          <p className="text-xs mt-0.5 opacity-90">{toast.description}</p>
        )}
      </div>
      <button onClick={onClose} className="ml-3 text-white opacity-70 hover:opacity-100 text-lg leading-none mt-0.5">
        ×
      </button>
    </div>
  );
}

export function useToast() {
  const addToast = useContext(ToastContext);
  if (!addToast) throw new Error('useToast must be used within ToastProvider');
  return {
    success: (title, opts) => addToast('success', title, opts?.description),
    error: (title, opts) => addToast('error', title, opts?.description),
    info: (title, opts) => addToast('info', title, opts?.description),
    warning: (title, opts) => addToast('warning', title, opts?.description),
  };
}

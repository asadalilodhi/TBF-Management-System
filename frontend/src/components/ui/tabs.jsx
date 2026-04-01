import { createContext, useContext, useState } from 'react';

const TabsCtx = createContext(null);

export function Tabs({ defaultValue, value, onValueChange, children, className = '' }) {
  const [active, setActive] = useState(defaultValue || '');
  const current = value !== undefined ? value : active;
  const setActive2 = onValueChange || setActive;
  return (
    <TabsCtx.Provider value={{ current, setActive: setActive2 }}>
      <div className={className}>{children}</div>
    </TabsCtx.Provider>
  );
}

export function TabsList({ children, className = '' }) {
  return (
    <div className={`flex rounded-lg bg-gray-100 p-1 gap-1 ${className}`}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className = '' }) {
  const { current, setActive } = useContext(TabsCtx);
  const isActive = current === value;
  return (
    <button
      onClick={() => setActive(value)}
      className={`flex-1 px-4 py-2 text-sm rounded-md transition-colors font-medium ${
        isActive
          ? 'bg-white text-black shadow-sm'
          : 'text-gray-600 hover:text-black'
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className = '' }) {
  const { current } = useContext(TabsCtx);
  if (current !== value) return null;
  return <div className={className}>{children}</div>;
}
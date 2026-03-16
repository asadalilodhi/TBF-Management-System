import { createContext, useContext, useState } from 'react';

// Exported so ProfileSwitcher and AdminSettings can reference them
export const mockUsers = [
  {
    id: 'U001',
    name: 'Admin User',
    role: 'super_admin',
    campus: 'Both',
    email: 'admin@bridgefoundation.org',
    username: 'admin',
  },
  {
    id: 'U002',
    name: 'Ms. Sana Khan',
    role: 'teacher',
    campus: 'North Campus',
    email: 'sana@bridgefoundation.org',
    username: 'sana',
  },
  {
    id: 'U003',
    name: 'Mr. Ahmed Raza',
    role: 'teacher',
    campus: 'South Campus',
    email: 'ahmed@bridgefoundation.org',
    username: 'ahmed',
  },
  {
    id: 'U004',
    name: 'North Campus Admin',
    role: 'admin',
    campus: 'North Campus',
    email: 'north.admin@bridgefoundation.org',
    username: 'northadmin',
  },
  {
    id: 'U005',
    name: 'South Campus Admin',
    role: 'admin',
    campus: 'South Campus',
    email: 'south.admin@bridgefoundation.org',
    username: 'southadmin',
  },
];

const UserContext = createContext(undefined);

export function UserProvider({ children, initialUser }) {
  const [currentUser, setCurrentUser] = useState(initialUser || mockUsers[0]);

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
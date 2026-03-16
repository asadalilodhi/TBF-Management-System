import { createContext, useContext, useState } from 'react';

const RegistrationContext = createContext(undefined);

const mockRequests = [
  {
    id: 'REQ001',
    name: 'Fatima Ahmed',
    email: 'fatima@bridgefoundation.org',
    role: 'teacher',
    campus: 'North Campus',
    requestedAt: '2026-02-27T10:30:00',
    status: 'pending',
  },
  {
    id: 'REQ002',
    name: 'Ali Hassan',
    email: 'ali.hassan@bridgefoundation.org',
    role: 'admin',
    campus: 'South Campus',
    requestedAt: '2026-02-26T14:15:00',
    status: 'pending',
  },
];

export function RegistrationProvider({ children }) {
  const [registrationRequests, setRegistrationRequests] = useState(mockRequests);

  const addRegistrationRequest = (request) => {
    const newRequest = {
      ...request,
      id: `REQ${String(registrationRequests.length + 1).padStart(3, '0')}`,
      requestedAt: new Date().toISOString(),
      status: 'pending',
    };
    setRegistrationRequests([newRequest, ...registrationRequests]);
  };

  const approveRequest = (id) => {
    setRegistrationRequests(
      registrationRequests.map((req) =>
        req.id === id ? { ...req, status: 'approved' } : req
      )
    );
  };

  const rejectRequest = (id, notes) => {
    setRegistrationRequests(
      registrationRequests.map((req) =>
        req.id === id ? { ...req, status: 'rejected', notes } : req
      )
    );
  };

  return (
    <RegistrationContext.Provider
      value={{ registrationRequests, addRegistrationRequest, approveRequest, rejectRequest }}
    >
      {children}
    </RegistrationContext.Provider>
  );
}

export function useRegistration() {
  const context = useContext(RegistrationContext);
  if (context === undefined) {
    throw new Error('useRegistration must be used within a RegistrationProvider');
  }
  return context;
}
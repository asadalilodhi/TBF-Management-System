import { createContext, useContext, useState } from 'react';

const AuditLogContext = createContext(undefined);

const initialLogs = [
  { id: 'LOG001', action: 'Syllabus Updated', user: 'Ms. Sana Khan', timestamp: '2026-01-30 10:30 AM', details: 'Grade 3 Mathematics - 45%' },
  { id: 'LOG002', action: 'Attendance Marked', user: 'Mr. Ahmed Raza', timestamp: '2026-01-30 09:15 AM', details: 'South Campus - Grade 2 Section A' },
  { id: 'LOG003', action: 'Student Added', user: 'North Campus Manager', timestamp: '2026-01-29 02:45 PM', details: 'New enrollment - Hira Qamar (GR #524)' },
  { id: 'LOG004', action: 'User Login', user: 'Admin User', timestamp: '2026-01-29 08:00 AM', details: 'System access granted' },
  { id: 'LOG005', action: 'Exam Results Entered', user: 'Ms. Fatima Noor', timestamp: '2026-01-28 03:30 PM', details: 'South Campus - Grade 5 - Term 1 Final' },
  { id: 'LOG006', action: 'Student Updated', user: 'Admin User', timestamp: '2026-01-28 11:20 AM', details: 'Updated scholarship status - Muhammad Ahmed Khan (50% scholarship)' },
  { id: 'LOG007', action: 'Attendance Marked', user: 'Ms. Sana Khan', timestamp: '2026-01-27 09:00 AM', details: 'North Campus - Grade 3 Section A' },
  { id: 'LOG008', action: 'User Role Modified', user: 'Admin User', timestamp: '2026-01-26 11:45 AM', details: 'Changed role for South Campus Manager to Admin' },
  { id: 'LOG009', action: 'Fee Payment Received', user: 'North Campus Manager', timestamp: '2026-01-25 01:15 PM', details: 'GR #234 - Ayesha Malik - PKR 5,000' },
  { id: 'LOG010', action: 'Staff Member Added', user: 'Admin User', timestamp: '2026-01-24 10:00 AM', details: 'New teacher - Ms. Zainab Ali (English Department)' },
];

export function AuditLogProvider({ children }) {
  const [auditLogs, setAuditLogs] = useState(initialLogs);

  const addAuditLog = (log) => {
    const newLog = {
      ...log,
      id: `LOG${String(auditLogs.length + 1).padStart(3, '0')}`,
      timestamp: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  return (
    <AuditLogContext.Provider value={{ auditLogs, addAuditLog }}>
      {children}
    </AuditLogContext.Provider>
  );
}

export function useAuditLog() {
  const context = useContext(AuditLogContext);
  if (context === undefined) {
    throw new Error('useAuditLog must be used within an AuditLogProvider');
  }
  return context;
}

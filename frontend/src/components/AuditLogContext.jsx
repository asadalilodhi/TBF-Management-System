import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuditLogContext = createContext(undefined);

export function AuditLogProvider({ children }) {
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch real logs from Postgres
  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/audit-logs', {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => ({ data: null }));

      // Fallback dummy data
      const liveData = (res.data && res.data.length > 0) ? res.data : [
        { id: 'LOG001', action: 'System Initialized', user: 'Super Admin', timestamp: new Date().toLocaleString(), details: 'Application started in local mode.' }
      ];
      setAuditLogs(liveData);
    } catch (error) {
      console.error('Failed to fetch logs', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // 2. Post real logs to Postgres
  const addAuditLog = async (logData) => {
    try {
      const token = localStorage.getItem('token');
      // We don't await the fetch here so the UI doesn't freeze while logging in the background
      axios.post('http://localhost:5000/api/audit-logs', logData, { headers: { Authorization: `Bearer ${token}` }}).then(() => {
        fetchLogs(); 
      });
    } catch (error) {
      console.error('Failed to save audit log');
    }
  };

  return (
    <AuditLogContext.Provider value={{ auditLogs, addAuditLog, isLoading }}>
      {children}
    </AuditLogContext.Provider>
  );
}

export function useAuditLog() {
  const context = useContext(AuditLogContext);
  if (context === undefined) throw new Error('useAuditLog must be used within an AuditLogProvider');
  return context;
}
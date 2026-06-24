import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const RegistrationContext = createContext(undefined);

export function RegistrationProvider({ children }) {
  const [registrationRequests, setRegistrationRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch real pending registrations from Postgres
  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/registrations/pending', {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => ({ data: null }));

      const liveData = res.data || [];
      setRegistrationRequests(liveData);
    } catch (error) {
      console.error('Failed to fetch registration requests', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // 2. Submit a new registration request (Used by the public RegistrationScreen)
  const addRegistrationRequest = async (requestData) => {
    try {
      await axios.post('http://localhost:5000/api/registrations', requestData);
      // We don't necessarily need to fetchRequests() here if the user isn't logged in, 
      // but it keeps the state synced if an admin is testing it.
      fetchRequests();
    } catch (error) {
      console.error('Failed to submit registration request');
      throw error;
    }
  };

  // 3. Approve request (Admin action)
  const approveRequest = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/registrations/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchRequests(); // Refresh the list
    } catch (error) {
      console.error('Failed to approve request');
      throw error;
    }
  };

  // 4. Reject request (Admin action)
  const rejectRequest = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/registrations/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchRequests(); // Refresh the list
    } catch (error) {
      console.error('Failed to reject request');
      throw error;
    }
  };

  return (
    <RegistrationContext.Provider value={{ 
      registrationRequests, 
      addRegistrationRequest, 
      approveRequest, 
      rejectRequest,
      isLoading 
    }}>
      {children}
    </RegistrationContext.Provider>
  );
}

export function useRegistration() {
  const context = useContext(RegistrationContext);
  if (context === undefined) throw new Error('useRegistration must be used within a RegistrationProvider');
  return context;
}
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CampusContext = createContext(undefined);

export function CampusProvider({ children }) {
  const [campuses, setCampuses] = useState([]);
  const [selectedCampus, setSelectedCampus] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch real campuses from Postgres (NO MOCK DATA)
  const fetchCampuses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/campuses', {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => ({ data: [] }));

      const liveData = res.data || [];
      setCampuses(liveData);
      
      // Auto-select the first campus if one exists
      if (liveData.length > 0) {
        setSelectedCampus(liveData[0].name);
      } else {
        setSelectedCampus('No Campus Available');
      }
    } catch (error) {
      console.error('Failed to fetch campuses', error);
      setCampuses([]);
      setSelectedCampus('No Campus Available');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampuses();
  }, []);

  const addCampus = async (campus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/campuses', campus, { headers: { Authorization: `Bearer ${token}` }});
      await fetchCampuses();
    } catch (error) {
      console.error('Failed to add campus');
      throw error;
    }
  };

  const updateCampus = async (id, updates) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/campuses/${id}`, updates, { headers: { Authorization: `Bearer ${token}` }});
      await fetchCampuses();
    } catch (error) {
      console.error('Failed to update campus');
      throw error;
    }
  };

  const deleteCampus = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/campuses/${id}`, { headers: { Authorization: `Bearer ${token}` }});
      await fetchCampuses();
    } catch (error) {
      console.error('Failed to delete campus');
      throw error;
    }
  };

  return (
    <CampusContext.Provider value={{ campuses, selectedCampus, setSelectedCampus, addCampus, updateCampus, deleteCampus, isLoading }}>
      {children}
    </CampusContext.Provider>
  );
}

export function useCampus() {
  const context = useContext(CampusContext);
  if (context === undefined) throw new Error('useCampus must be used within a CampusProvider');
  return context;
}
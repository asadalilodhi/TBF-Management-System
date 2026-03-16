import { createContext, useContext, useState } from 'react';

const CampusContext = createContext(undefined);

const initialCampuses = [
  {
    id: 'C1',
    name: 'North Campus',
    address: 'Block A, North District, Karachi',
    phone: '+92-21-1111-0001',
    isActive: true,
  },
  {
    id: 'C2',
    name: 'South Campus',
    address: 'Block B, South District, Karachi',
    phone: '+92-21-1111-0002',
    isActive: true,
  },
];

export function CampusProvider({ children, initialCampus }) {
  const [campuses, setCampuses] = useState(initialCampuses);
  const [selectedCampus, setSelectedCampus] = useState(initialCampus || 'North Campus');

  const addCampus = (campus) => {
    const newCampus = {
      ...campus,
      id: `C${campuses.length + 1}`,
    };
    setCampuses([...campuses, newCampus]);
  };

  const updateCampus = (id, updates) => {
    setCampuses(campuses.map(campus =>
      campus.id === id ? { ...campus, ...updates } : campus
    ));
  };

  const deleteCampus = (id) => {
    setCampuses(campuses.filter(campus => campus.id !== id));
  };

  return (
    <CampusContext.Provider value={{
      campuses,
      selectedCampus,
      setSelectedCampus,
      addCampus,
      updateCampus,
      deleteCampus
    }}>
      {children}
    </CampusContext.Provider>
  );
}

export function useCampus() {
  const context = useContext(CampusContext);
  if (context === undefined) {
    throw new Error('useCampus must be used within a CampusProvider');
  }
  return context;
}

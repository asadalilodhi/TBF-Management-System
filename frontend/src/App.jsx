import { useState } from 'react';
import Login from './Pages/Login.jsx';
import MainLayout from './Components/MainLayout.jsx';
import { RegistrationScreen } from './Components/RegistrationScreen.jsx';
import { UserProvider } from './Components/UserContext.jsx';
import { CampusProvider } from './Components/CampusContext.jsx';
import { AuditLogProvider } from './Components/AuditLogContext.jsx';
import { RegistrationProvider } from './Components/RegistrationContext.jsx';
import { ToastProvider } from './Components/ui/toast.jsx';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [initialCampus, setInitialCampus] = useState('North Campus');

  const handleLogin = (user, campus) => {
    setLoggedInUser(user);
    setInitialCampus(campus || 'North Campus');
    setIsAuthenticated(true);
  };

  return (
    <ToastProvider>
      <RegistrationProvider>
        {isAuthenticated ? (
          <UserProvider initialUser={loggedInUser}>
            <CampusProvider initialCampus={initialCampus}>
              <AuditLogProvider>
                <MainLayout />
              </AuditLogProvider>
            </CampusProvider>
          </UserProvider>
        ) : showRegistration ? (
          <RegistrationScreen onNavigateBack={() => setShowRegistration(false)} />
        ) : (
          <Login onLogin={handleLogin} onRegister={() => setShowRegistration(true)} />
        )}
      </RegistrationProvider>
    </ToastProvider>
  );
}

export default App;
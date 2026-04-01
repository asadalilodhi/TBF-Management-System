import { useState } from 'react';
import Login from './Pages/Login.jsx';
import MainLayout from './components/MainLayout.jsx';
import { RegistrationScreen } from './components/RegistrationScreen.jsx';
import { UserProvider } from './components/UserContext.jsx';
import { CampusProvider } from './components/CampusContext.jsx';
import { AuditLogProvider } from './components/AuditLogContext.jsx';
import { RegistrationProvider } from './components/RegistrationContext.jsx';
import { ToastProvider } from './components/ui/toast.jsx';

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
          <RegistrationScreen onBackToLogin={() => setShowRegistration(false)} />
        ) : (
          <Login onLogin={handleLogin} onRegister={() => setShowRegistration(true)} />
        )}
      </RegistrationProvider>
    </ToastProvider>
  );
}

export default App;
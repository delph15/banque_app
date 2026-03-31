import React, { useState, useEffect } from 'react';
import GestionClients from './components/GestionClients';
import AjouterClient from './components/AjouterClient';
import Statistiques from './components/Statistiques';
import LoginGerant from './components/LoginGerant';
import authService from './services/auth';

const App = () => {
  const [currentPage, setCurrentPage] = useState('clients');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà authentifié au chargement
    if (authService.isAuthenticated()) {
      setIsAuthenticated(true);
      setUser({ email: 'user@aeeni.edu', name: 'Utilisateur AEENI' });
    }
  }, []);

  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    setCurrentPage('clients'); // Rediriger vers la page clients après connexion
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    setCurrentPage('login');
  };

  const renderPage = () => {
    // Si non authentifié, afficher la page de connexion
    if (!isAuthenticated) {
      return <LoginGerant onNavigate={navigateTo} onLogin={handleLogin} />;
    }

    // Si authentifié, afficher les pages de l'application
    switch(currentPage) {
      case 'clients':
        return <GestionClients onNavigate={navigateTo} user={user} onLogout={handleLogout} />;
      case 'ajouter':
        return <AjouterClient onNavigate={navigateTo} user={user} onLogout={handleLogout} />;
      case 'statistiques':
        return <Statistiques onNavigate={navigateTo} user={user} onLogout={handleLogout} />;
      default:
        return <GestionClients onNavigate={navigateTo} user={user} onLogout={handleLogout} />;
    }
  };

  return (
    <div>
      {renderPage()}
    </div>
  );
};

export default App;

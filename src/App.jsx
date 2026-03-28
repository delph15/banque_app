import React, { useState } from 'react';
import GestionClients from './components/GestionClients';
import AjouterClient from './components/AjouterClient';
import Statistiques from './components/Statistiques';
import Connexion from './components/Connexion';

const App = () => {
  const [currentPage, setCurrentPage] = useState('clients');
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [user, setUser] = useState({ email: 'user@aeeni.edu', name: 'Utilisateur AEENI' });

  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    setCurrentPage('clients'); // Rediriger vers la page clients après connexion
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setCurrentPage('clients');
  };

  const renderPage = () => {
    // Si non authentifié, afficher la page de connexion
    if (!isAuthenticated) {
      return <Connexion onLogin={handleLogin} />;
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

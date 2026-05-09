import React, { useState, useEffect, useCallback } from 'react';
import { Search, Edit, Trash2, UserPlus, LogOut, BarChart3, Users, Plus, Home, X, Wallet, ArrowUpCircle, ArrowDownCircle, ChevronRight, ChevronLeft, CheckCircle2, AlertCircle, ShieldCheck, Lock, TrendingUp, TrendingDown, Sun, Moon } from 'lucide-react';
import api from '../services/api';

const GestionClients = ({ onNavigate, user, onLogout }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editStep, setEditStep] = useState(1);
  const [editErrors, setEditErrors] = useState({});
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [clientsPerPage] = useState(10);
  const [darkMode, setDarkMode] = useState(true);

  const getStatut = (solde) => {
    if (solde < 1000) return { text: 'Insuffisant', color: 'bg-red-100 text-red-800' };
    if (solde >= 1000 && solde <= 5000) return { text: 'Moyen', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'Élevé', color: 'bg-green-100 text-green-800' };
  };

  const filteredClients = clients.filter(client =>
    client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.numCompte.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastClient = currentPage * clientsPerPage;
  const indexOfFirstClient = indexOfLastClient - clientsPerPage;
  const currentClients = filteredClients.slice(indexOfFirstClient, indexOfLastClient);
  const totalPages = Math.ceil(filteredClients.length / clientsPerPage);

  const handleEdit = (client) => {
    console.log('Client cliqué:', client); // Debug pour voir la structure
    setEditingClient({
      id: client.id || client.numCompte, // Utiliser numCompte comme fallback si id n'existe pas
      nom: client.nom,
      soldeActuel: typeof client.solde === 'number' ? client.solde : parseFloat(client.solde) || 0,
      solde: 0, // Réinitialiser le solde pour le champ "montant"
      operation: 'depot'
    });
    setEditStep(1);
    setEditErrors({});
    setShowEditModal(true);
  };

  const handleUpdateClient = async (e) => {
    e.preventDefault();
    console.log('editingClient:', editingClient); // Debug
    try {
      const response = await api.updateClient(editingClient.id, editingClient);
      
      // Mettre à jour le client avec les nouvelles données du backend
      setClients(prevClients => 
        prevClients.map(client => 
          (client.id === editingClient.id || client.numCompte === editingClient.id)
            ? { ...client, nom: response.nom || editingClient.nom, solde: response.solde }
            : client
        )
      );
      
      setShowEditModal(false);
      setEditingClient(null);
      
      // Afficher un message de succès personnalisé
      setSuccessMessage('Client modifié avec succès!');
      setShowSuccess(true);
      
      // Cacher le message après 2 secondes
      setTimeout(() => {
        setShowSuccess(false);
        setSuccessMessage('');
      }, 2000);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      setSuccessMessage('Erreur lors de la mise à jour du client');
      setShowSuccess(true);
      
      // Cacher le message d'erreur après 3 secondes
      setTimeout(() => {
        setShowSuccess(false);
        setSuccessMessage('');
      }, 3000);
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingClient(null);
    setEditStep(1);
    setEditErrors({});
  };

  const formatMGA = (value) => {
    if (value == null) return '–';
    const n = Number(value);
    if (!Number.isFinite(n)) return '–';
    return `${n.toLocaleString('fr-FR')} MGA`;
  };

  const validateEdit = useCallback(() => {
    if (!editingClient) return false;
    const montantNum = parseFloat(editingClient.solde) || 0;
    const soldeActuel = parseFloat(editingClient.soldeActuel) || 0;
    const opType = editingClient.operation || 'depot';
    const errs = {};
    if (!editingClient.solde || montantNum <= 0) errs.montant = 'Le montant doit être supérieur à 0.';
    if (opType === 'retrait' && montantNum > soldeActuel) {
      errs.montant = `Solde insuffisant. Maximum : ${formatMGA(soldeActuel)}`;
    }
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  }, [editingClient]);

  const handleDelete = async (id) => {
    setClientToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await api.deleteClient(clientToDelete);
      setClients(clients.filter(client => client.id !== clientToDelete));
      setSuccessMessage('Client supprimé avec succès!');
      setShowSuccess(true);
      setShowDeleteModal(false);
      setClientToDelete(null);
      
      // Cacher le message d'erreur après 3 secondes
      setTimeout(() => {
        setShowSuccess(false);
        setSuccessMessage('');
      }, 2000);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setSuccessMessage('Erreur lors de la suppression du client');
      setShowSuccess(true);
      setShowDeleteModal(false);
      setClientToDelete(null);
      
      // Cacher le message d'erreur après 3 secondes
      setTimeout(() => {
        setShowSuccess(false);
        setSuccessMessage('');
      }, 3000);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setClientToDelete(null);
  };

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const data = await api.getClients();
        setClients(data);
        setError(null);
      } catch (error) {
        console.error('Erreur lors du chargement des clients:', error);
        setError('Impossible de charger les clients');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();

    const timer = setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-violet-100">
      {/* Barre de navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <span className="ml-2 text-xl font-semibold text-gray-900">Banque AEENI</span>
              </div>
              <div className="hidden md:flex space-x-6">
                <a href="#" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1">Clients</a>
                <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('ajouter'); }} className="text-gray-600 hover:text-gray-900 pb-1">Ajouter</a>
                <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('statistiques'); }} className="text-gray-600 hover:text-gray-900 pb-1">Statistiques</a>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message de succès */}
        {showSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-green-800 font-medium">{successMessage}</span>
            </div>
            <button 
              onClick={() => {
                setShowSuccess(false);
                setSuccessMessage('');
              }}
              className="text-green-600 hover:text-green-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* En-tête de la page */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Clients</h1>
          <p className="text-gray-600">Projet Étudiant - Système de Registre AEENI</p>
        </div>

        {/* Barre d'outils */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button 
            onClick={() => onNavigate('ajouter')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Nouveau Client
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Chargement des clients...</span>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <span className="text-red-800 font-medium">Erreur</span>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tableau des clients */}
        {!loading && !error && (
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Num Compte
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom Complet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Solde
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentClients.map((client) => {
                  const statut = getStatut(client.solde);
                  return (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {client.numCompte}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {client.nom}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {client.solde.toLocaleString('fr-MG')} Ar
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statut.color}`}>
                          {statut.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(client)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(client.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* Pagination */}
        {!loading && !error && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Affichage de {indexOfFirstClient + 1} à {Math.min(indexOfLastClient, filteredClients.length)} sur {filteredClients.length} clients
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              <div className="flex space-x-1">
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`px-3 py-1 text-sm border rounded-md ${
                      currentPage === index + 1
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
        
        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="mt-3 text-center">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Confirmer la suppression
                  </h3>
                  <div className="mt-2 px-7 py-3">
                    <p className="text-sm text-gray-500">
                      Êtes-vous sûr de vouloir supprimer ce client ? Cette action ne peut pas être annulée.
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex justify-center space-x-4">
                  <button
                    onClick={cancelDelete}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Edit Modal */}
        {showEditModal && editingClient && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overlay-enter"
            style={{ background: 'rgba(2,6,23,0.75)', backdropFilter: 'blur(8px)' }}
            onClick={(e) => e.target === e.currentTarget && handleCancelEdit()}
          >
            {(() => {
              const montantNum = parseFloat(editingClient.solde) || 0;
              const soldeActuel = parseFloat(editingClient.soldeActuel) || 0;
              const opType = editingClient.operation || 'depot';
              const impact = opType === 'depot' ? montantNum : -montantNum;
              const newBalance = soldeActuel + impact;
              const needsConfirmStep = montantNum > 500000;
              const showRecapInline = montantNum > 0 && montantNum <= 500000 && Object.keys(editErrors).length === 0;
              const isPositive = impact >= 0;

              const handleKey = (e) => {
                if (e.key === 'Escape') handleCancelEdit();
              };

              return (
                <>
                  <div
                    className="modal-enter w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]"
                    style={{
                      background: darkMode
                        ? 'linear-gradient(160deg, #0f172a 0%, #0d1424 100%)'
                        : 'linear-gradient(160deg, #f8fafc 0%, #e2e8f0 100%)',
                      border: darkMode
                        ? '1px solid rgba(255,255,255,0.08)'
                        : '1px solid rgba(0,0,0,0.08)',
                      boxShadow: darkMode
                        ? '0 0 0 1px rgba(99,102,241,0.15), 0 32px 80px rgba(0,0,0,0.6), 0 0 80px rgba(99,102,241,0.08)'
                        : '0 0 0 1px rgba(99,102,241,0.1), 0 8px 32px rgba(0,0,0,0.12), 0 0 40px rgba(99,102,241,0.04)',
                      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
                    }}
                    tabIndex={-1}
                    onKeyDown={handleKey}
                  >
                    <div
                      className="h-1 w-full flex-shrink-0"
                      style={{ background: 'linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6, #ec4899)' }}
                    />

                    <div className="overflow-y-auto flex-1 scrollbar-thin">
                      {/* Toggle mode */}
                      <div className="flex justify-end p-4 pb-0">
                        <button
                          type="button"
                          onClick={() => setDarkMode(!darkMode)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                            darkMode
                              ? 'bg-white/10 hover:bg-white/20 text-white'
                              : 'bg-gray-800/10 hover:bg-gray-800/20 text-gray-800'
                          }`}
                          style={{
                            border: darkMode ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.12)',
                          }}
                        >
                          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                        </button>
                      </div>
                      {editStep === 1 ? (
                        <div className="p-6 flex flex-col gap-5">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                                style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
                              >
                                <Users size={18} className="text-white" />
                              </div>
                              <div>
                                <h2 className={`font-bold text-lg leading-tight ${
                                  darkMode ? 'text-white' : 'text-gray-800'
                                }`}>Modifier le client</h2>
                                <p className={`text-xs mt-0.5 ${
                                  darkMode ? 'text-slate-400' : 'text-gray-600'
                                }`}>Effectuer une opération sur le compte du client.</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                                darkMode 
                                  ? 'text-slate-400 hover:text-white hover:bg-white/10' 
                                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100/50'
                              }`}
                            >
                              <X size={16} />
                            </button>
                          </div>

                          <div className="h-px bg-white/5" />

                          <div className="flex flex-col gap-1.5">
                            <label className={`flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider ${
                              darkMode ? 'text-slate-400' : 'text-gray-600'
                            }`}>
                              <span className={darkMode ? 'text-slate-500' : 'text-gray-500'}><Users size={14} /></span>
                              Client
                            </label>
                            <input
                              type="text"
                              value={editingClient.nom}
                              onChange={(e) => setEditingClient({ ...editingClient, nom: e.target.value })}
                              className={`w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 ${
                                darkMode 
                                  ? 'text-white placeholder-slate-500' 
                                  : 'text-gray-800 placeholder-gray-500'
                              }`}
                              style={{
                                background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                                border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)'
                              }}
                              required
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className={`flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider ${
                              darkMode ? 'text-slate-400' : 'text-gray-600'
                            }`}>
                              <span className={darkMode ? 'text-slate-500' : 'text-gray-500'}><Wallet size={14} /></span>
                              Solde actuel
                            </label>
                            <div
                              className="w-full px-4 py-3 rounded-xl flex items-center justify-between"
                              style={{
                                background: darkMode ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.04)',
                                border: darkMode ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(16,185,129,0.15)'
                              }}
                            >
                              <span className={`font-bold text-lg ${
                                darkMode ? 'text-emerald-400' : 'text-emerald-600'
                              }`}>{formatMGA(soldeActuel)}</span>
                              <div className={`w-2 h-2 rounded-full animate-pulse ${
                                darkMode ? 'bg-emerald-400' : 'bg-emerald-500'
                              }`} />
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className={`flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider ${
                              darkMode ? 'text-slate-400' : 'text-gray-600'
                            }`}>
                              <span className={darkMode ? 'text-slate-500' : 'text-gray-500'}><TrendingUp size={14} /></span>
                              Type d'opération
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                              <button
                                type="button"
                                onClick={() => { setEditingClient({ ...editingClient, operation: 'depot' }); setEditErrors({}); }}
                                className="flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all duration-200"
                                style={
                                  opType === 'depot'
                                    ? {
                                        background: 'rgba(59,130,246,0.1)',
                                        border: '1.5px solid rgba(59,130,246,0.4)',
                                        boxShadow: '0 0 0 3px rgba(59,130,246,0.4)',
                                        color: '#93c5fd',
                                      }
                                    : darkMode
                                    ? {
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1.5px solid rgba(255,255,255,0.08)',
                                        color: '#94a3b8',
                                      }
                                    : {
                                        background: 'rgba(0,0,0,0.02)',
                                        border: '1.5px solid rgba(0,0,0,0.08)',
                                        color: '#6b7280',
                                      }
                                }
                              >
                                <div style={{ color: opType === 'depot' ? '#93c5fd' : (darkMode ? '#64748b' : '#4b5563') }}>
                                  <ArrowUpCircle size={16} />
                                </div>
                                <span className="text-sm font-medium" style={{ color: opType === 'depot' ? '#93c5fd' : (darkMode ? '#94a3b8' : '#6b7280') }}>Dépôt</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => { setEditingClient({ ...editingClient, operation: 'retrait' }); setEditErrors({}); }}
                                className="flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all duration-200"
                                style={
                                  opType === 'retrait'
                                    ? {
                                        background: 'rgba(139,92,246,0.1)',
                                        border: '1.5px solid rgba(139,92,246,0.4)',
                                        boxShadow: '0 0 0 3px rgba(139,92,246,0.4)',
                                        color: '#c4b5fd',
                                      }
                                    : darkMode
                                    ? {
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1.5px solid rgba(255,255,255,0.08)',
                                        color: '#94a3b8',
                                      }
                                    : {
                                        background: 'rgba(0,0,0,0.02)',
                                        border: '1.5px solid rgba(0,0,0,0.08)',
                                        color: '#6b7280',
                                      }
                                }
                              >
                                <div style={{ color: opType === 'retrait' ? '#c4b5fd' : (darkMode ? '#64748b' : '#4b5563') }}>
                                  <ArrowDownCircle size={16} />
                                </div>
                                <span className="text-sm font-medium" style={{ color: opType === 'retrait' ? '#c4b5fd' : (darkMode ? '#94a3b8' : '#6b7280') }}>Retrait</span>
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className={`flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider ${
                              darkMode ? 'text-slate-400' : 'text-gray-600'
                            }`}>
                              <span className={darkMode ? 'text-slate-500' : 'text-gray-500'}><TrendingDown size={14} /></span>
                              Montant (MGA)
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                min="0"
                                value={editingClient.solde}
                                onChange={(e) => { setEditingClient({ ...editingClient, solde: e.target.value }); setEditErrors({}); }}
                                placeholder="Ex : 350 000"
                                className={`w-full px-4 py-3 pr-16 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all duration-200 ${
                                  darkMode 
                                    ? 'text-white placeholder-slate-500' 
                                    : 'text-gray-800 placeholder-gray-500'
                                }`}
                                style={{
                                  background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                                  border: `1px solid ${editErrors.montant ? 'rgba(239,68,68,0.5)' : (darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)')}`,
                                }}
                              />
                              <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold ${
                                darkMode ? 'text-slate-400' : 'text-gray-500'
                              }`}>MGA</span>
                            </div>
                            {editErrors.montant && (
                              <div className={`flex items-center gap-1.5 mt-1.5 text-xs ${
                                darkMode ? 'text-red-400' : 'text-red-600'
                              }`}>
                                <AlertCircle size={12} />{editErrors.montant}
                              </div>
                            )}
                          </div>

                          {montantNum > 0 && !editErrors.montant && (
                            <div
                              className="rounded-2xl p-4 flex items-center justify-between gap-4 transition-all duration-300"
                              style={{
                                background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                border: darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)'
                              }}
                            >
                              <div>
                                <p className={`text-xs mb-1 ${
                                  darkMode ? 'text-slate-400' : 'text-gray-600'
                                }`}>Impact de l'opération</p>
                                <p className={`text-lg font-bold ${
                                  isPositive ? (darkMode ? 'text-emerald-400' : 'text-emerald-600') : (darkMode ? 'text-orange-400' : 'text-orange-600')
                                }`}>
                                  {isPositive ? '+' : ''}{formatMGA(impact)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className={`text-xs mb-1 ${
                                  darkMode ? 'text-slate-400' : 'text-gray-600'
                                }`}>Nouveau solde</p>
                                <p className={`text-lg font-bold ${
                                  darkMode ? 'text-blue-300' : 'text-blue-600'
                                }`}>{formatMGA(newBalance)}</p>
                              </div>
                            </div>
                          )}

                          {showRecapInline && (
                            <div
                              className="rounded-2xl overflow-hidden"
                              style={{ 
                                border: '1px solid rgba(99,102,241,0.2)', 
                                background: darkMode ? 'rgba(99,102,241,0.05)' : 'rgba(99,102,241,0.03)' 
                              }}
                            >
                              <div
                                className="px-4 py-3 flex items-center gap-2"
                                style={{ 
                                  background: darkMode ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.08)', 
                                  borderBottom: '1px solid rgba(99,102,241,0.15)' 
                                }}
                              >
                                <ShieldCheck size={14} className={darkMode ? 'text-indigo-400' : 'text-indigo-600'} />
                                <p className={`text-sm font-semibold ${
                                  darkMode ? 'text-indigo-300' : 'text-indigo-700'
                                }`}>Récapitulatif</p>
                              </div>
                              <div className="px-4 py-3 flex flex-col gap-2">
                                <div className="flex items-center justify-between gap-2">
                                  <span className={`text-xs ${
                                    darkMode ? 'text-slate-400' : 'text-gray-600'
                                  }`}>Client</span>
                                  <span className="text-sm font-medium" style={{ 
                                    color: darkMode ? '#e2e8f0' : '#1f2937' 
                                  }}>{editingClient.nom}</span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                  <span className={`text-xs ${
                                    darkMode ? 'text-slate-400' : 'text-gray-600'
                                  }`}>Type d'opération</span>
                                  <span className="text-sm font-medium" style={{ 
                                    color: darkMode ? '#818cf8' : '#4f46e5' 
                                  }}>{opType === 'depot' ? 'Dépôt' : 'Retrait'}</span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                  <span className={`text-xs ${
                                    darkMode ? 'text-slate-400' : 'text-gray-600'
                                  }`}>Montant</span>
                                  <span className="text-sm font-medium" style={{ 
                                    color: darkMode ? '#818cf8' : '#4f46e5' 
                                  }}>{formatMGA(montantNum)}</span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                  <span className={`text-xs ${
                                    darkMode ? 'text-slate-400' : 'text-gray-600'
                                  }`}>Solde actuel</span>
                                  <span className="text-sm font-medium" style={{ 
                                    color: darkMode ? '#e2e8f0' : '#1f2937' 
                                  }}>{formatMGA(soldeActuel)}</span>
                                </div>
                                <div className={`h-px my-1 ${
                                  darkMode ? 'bg-white/5' : 'bg-gray-200'
                                }`} />
                                <div className="flex items-center justify-between gap-2">
                                  <span className={`text-xs ${
                                    darkMode ? 'text-slate-400' : 'text-gray-600'
                                  }`}>Nouveau solde</span>
                                  <span className="text-sm font-bold" style={{ 
                                    color: darkMode ? '#34d399' : '#059669' 
                                  }}>{formatMGA(newBalance)}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {needsConfirmStep && montantNum > 0 && !editErrors.montant && (
                            <div
                              className={`flex items-start gap-2.5 px-4 py-3 rounded-xl text-xs ${
                                darkMode ? 'text-amber-300' : 'text-amber-700'
                              }`}
                              style={{ 
                                background: darkMode ? 'rgba(251,191,36,0.07)' : 'rgba(251,191,36,0.04)', 
                                border: '1px solid rgba(251,191,36,0.15)' 
                              }}
                            >
                              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                              <p>Cette opération dépasse 500 000 MGA. Vous serez invité à confirmer à l'étape suivante.</p>
                            </div>
                          )}

                          <div className="flex gap-3 pt-1">
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              className={`flex-1 py-3 rounded-2xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                                darkMode 
                                  ? 'text-slate-400 hover:text-white hover:bg-white/5' 
                                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100/50'
                              }`}
                              style={{ 
                                border: darkMode 
                                  ? '1px solid rgba(255,255,255,0.1)' 
                                  : '1px solid rgba(0,0,0,0.08)' 
                              }}
                            >
                              Annuler
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (!validateEdit()) return;
                                if (needsConfirmStep) setEditStep(2);
                                else handleUpdateClient({ preventDefault: () => {} });
                              }}
                              className="flex-[2] py-3 rounded-2xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98]"
                              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 60%, #8b5cf6 100%)' }}
                            >
                              {needsConfirmStep && montantNum > 0
                                ? <><span>Valider</span><ChevronRight size={16} /></>
                                : <><CheckCircle2 size={16} /><span>Valider l'opération</span></>
                              }
                            </button>
                          </div>

                          <div className={`flex items-center justify-center gap-1.5 text-xs ${
                            darkMode ? 'text-slate-500' : 'text-gray-500'
                          }`}>
                            <Lock size={10} />
                            <span>Toutes les actions sont sécurisées et tracées.</span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 flex flex-col gap-5 step-enter">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                            >
                              <ShieldCheck size={18} className="text-white" />
                            </div>
                            <div>
                              <h2 className={`font-bold text-lg leading-tight ${
                                darkMode ? 'text-white' : 'text-gray-800'
                              }`}>Récapitulatif de l'opération</h2>
                              <p className={`text-xs mt-0.5 ${
                                darkMode ? 'text-slate-400' : 'text-gray-600'
                              }`}>Veuillez vérifier les informations avant de confirmer.</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5">
                              <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                                style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8' }}
                              >
                                ✓
                              </div>
                              <span className={darkMode ? 'text-slate-500 text-xs' : 'text-gray-500 text-xs'}>Saisie</span>
                            </div>
                            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />
                            <div className="flex items-center gap-1.5">
                              <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
                              >
                                2
                              </div>
                              <span className={`text-xs font-medium ${
                                darkMode ? 'text-white' : 'text-gray-800'
                              }`}>Confirmation</span>
                            </div>
                          </div>

                          <div className="h-px bg-white/5" />

                          <div
                            className="flex items-start gap-3 px-4 py-3.5 rounded-2xl"
                            style={{ 
                              background: darkMode ? 'rgba(251,191,36,0.07)' : 'rgba(251,191,36,0.04)', 
                              border: '1px solid rgba(251,191,36,0.2)' 
                            }}
                          >
                            <AlertCircle size={16} className={darkMode ? 'text-amber-400 flex-shrink-0 mt-0.5' : 'text-amber-600 flex-shrink-0 mt-0.5'} />
                            <div>
                              <p className={`text-sm font-semibold ${
                                darkMode ? 'text-amber-300' : 'text-amber-700'
                              }`}>Cette opération dépasse 500 000 MGA.</p>
                              <p className={`text-xs mt-0.5 ${
                                darkMode ? 'text-amber-400/70' : 'text-amber-600/70'
                              }`}>Confirmez pour poursuivre.</p>
                            </div>
                          </div>

                          <div
                            className="rounded-2xl overflow-hidden"
                            style={{ 
                              background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', 
                              border: darkMode ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)' 
                            }}
                          >
                            <div className="px-4 py-3 flex flex-col gap-3">
                              <div className="flex items-center justify-between gap-2">
                                <span className={`text-xs ${
                                  darkMode ? 'text-slate-400' : 'text-gray-600'
                                }`}>Client</span>
                                <span className="text-sm font-medium" style={{ 
                                  color: darkMode ? '#e2e8f0' : '#1f2937' 
                                }}>{editingClient.nom}</span>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <span className={`text-xs ${
                                  darkMode ? 'text-slate-400' : 'text-gray-600'
                                }`}>Type d'opération</span>
                                <span className="text-sm font-medium" style={{ 
                                  color: darkMode ? '#818cf8' : '#4f46e5' 
                                }}>{opType === 'depot' ? 'Dépôt' : 'Retrait'}</span>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <span className={`text-xs ${
                                  darkMode ? 'text-slate-400' : 'text-gray-600'
                                }`}>Montant</span>
                                <span className="text-sm font-medium" style={{ 
                                  color: darkMode ? '#818cf8' : '#4f46e5' 
                                }}>{formatMGA(montantNum)}</span>
                              </div>
                              <div className={`h-px ${
                                darkMode ? 'bg-white/5' : 'bg-gray-200'
                              }`} />
                              <div className="flex items-center justify-between gap-2">
                                <span className={`text-xs ${
                                  darkMode ? 'text-slate-400' : 'text-gray-600'
                                }`}>Solde actuel</span>
                                <span className="text-sm font-medium" style={{ 
                                  color: darkMode ? '#e2e8f0' : '#1f2937' 
                                }}>{formatMGA(soldeActuel)}</span>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <span className={`text-xs ${
                                  darkMode ? 'text-slate-400' : 'text-gray-600'
                                }`}>Nouveau solde</span>
                                <span className="text-sm font-bold" style={{ 
                                  color: darkMode ? '#34d399' : '#059669' 
                                }}>{formatMGA(newBalance)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-3 pt-1">
                            <button
                              type="button"
                              onClick={() => setEditStep(1)}
                              className={`flex-1 py-3 rounded-2xl text-sm font-medium flex items-center justify-center gap-1.5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                                darkMode 
                                  ? 'text-slate-400 hover:text-white hover:bg-white/5' 
                                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100/50'
                              }`}
                              style={{ 
                                border: darkMode 
                                  ? '1px solid rgba(255,255,255,0.1)' 
                                  : '1px solid rgba(0,0,0,0.08)' 
                              }}
                            >
                              <ChevronLeft size={15} /> Retour
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (!validateEdit()) return;
                                handleUpdateClient({ preventDefault: () => {} });
                              }}
                              className="flex-[2] py-3 rounded-2xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98]"
                              style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                            >
                              <Lock size={15} /> Confirmer l'opération
                            </button>
                          </div>

                          <div className={`flex items-center justify-center gap-1.5 text-xs ${
                            darkMode ? 'text-slate-500' : 'text-gray-500'
                          }`}>
                            <Lock size={10} />
                            <span>Toutes les actions sont sécurisées et tracées.</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <style>{`
                    @keyframes modalIn {
                      from { opacity: 0; transform: scale(0.92) translateY(20px); }
                      to   { opacity: 1; transform: scale(1)    translateY(0); }
                    }
                    @keyframes overlayIn {
                      from { opacity: 0; }
                      to   { opacity: 1; }
                    }
                    @keyframes stepSlide {
                      from { opacity: 0; transform: translateX(32px); }
                      to   { opacity: 1; transform: translateX(0); }
                    }
                    .modal-enter  { animation: modalIn   0.35s cubic-bezier(0.34,1.56,0.64,1) forwards; }
                    .overlay-enter { animation: overlayIn 0.25s ease forwards; }
                    .step-enter   { animation: stepSlide  0.3s cubic-bezier(0.34,1.2,0.64,1) forwards; }
                    input[type=number]::-webkit-inner-spin-button,
                    input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
                    input[type=number] { -moz-appearance: textfield; }
                  `}</style>
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default GestionClients;

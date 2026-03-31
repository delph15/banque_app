import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, UserPlus, LogOut, BarChart3, Users, Plus, Home } from 'lucide-react';
import api from '../services/api';

const GestionClients = ({ onNavigate, user, onLogout }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [clientsPerPage] = useState(10);

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
      solde: 0 // Réinitialiser le solde pour le champ "montant à ajouter"
    });
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
          client.id === editingClient.id 
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
  };

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
    <div className="min-h-screen bg-gray-50">
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
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Modifier le client</h3>
                <form onSubmit={handleUpdateClient} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                    <input
                      type="text"
                      value={editingClient.nom}
                      onChange={(e) => setEditingClient({...editingClient, nom: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Montant à ajouter</label>
                    <input
                      type="number"
                      placeholder="Le montant à ajouter"
                      onChange={(e) => setEditingClient({...editingClient, solde: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Ce montant sera ajouté au solde actuel</p>
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Enregistrer
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GestionClients;

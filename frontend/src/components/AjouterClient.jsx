import React, { useState } from 'react';
import { LogOut, Users, Plus, BarChart3, ArrowLeft, Home } from 'lucide-react';
import api from '../services/api';

const AjouterClient = ({ onNavigate, user, onLogout }) => {
  const [formData, setFormData] = useState({
    nom: '',
    sexe: 'H',
    solde: ''
  });
  
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom complet est requis';
    } else if (formData.nom.length < 3) {
      newErrors.nom = 'Le nom doit contenir au moins 3 caractères';
    }
    
    if (!formData.solde) {
      newErrors.solde = 'Le solde initial est requis';
    } else if (isNaN(formData.solde) || parseFloat(formData.solde) < 0) {
      newErrors.solde = 'Le solde doit être un nombre positif';
    }
    
    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      try {
        setLoading(true);
        const clientData = {
          ...formData,
          solde: parseFloat(formData.solde)
        };
        
        const result = await api.createClient(clientData);
        console.log('Client créé avec succès:', result);
        
        // Afficher le message de succès
        setShowSuccess(true);
        
        // Réinitialiser le formulaire
        setFormData({
          nom: '',
          sexe: 'H',
          solde: ''
        });
        
        // Cacher le message après 2 secondes et retourner à la liste
        setTimeout(() => {
          setShowSuccess(false);
          onNavigate('clients');
        }, 2000);
        
        setErrors({});
      } catch (error) {
        console.error('Erreur lors de la création du client:', error);
        setErrors({ submit: 'Erreur lors de la création du client: ' + error.message });
      } finally {
        setLoading(false);
      }
    } else {
      setErrors(newErrors);
    }
  };

  const handleCancel = () => {
    setFormData({
      nom: '',
      sexe: 'H',
      solde: ''
    });
    setErrors({});
    onNavigate('clients');
  };

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
                <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('clients'); }} className="text-gray-600 hover:text-gray-900 pb-1">Clients</a>
                <a href="#" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1">Ajouter</a>
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

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error message */}
        {errors.submit && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <span className="text-red-800 font-medium">Erreur</span>
                <p className="text-red-700 text-sm mt-1">{errors.submit}</p>
              </div>
            </div>
          </div>
        )}

        {/* Message de succès */}
        {showSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-green-800 font-medium">Client ajouté avec succès!</span>
            </div>
            <button 
              onClick={() => setShowSuccess(false)}
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ajouter un nouveau client</h1>
        </div>

        {/* Formulaire */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sexe */}
            <div>
              <label htmlFor="sexe" className="block text-sm font-medium text-gray-700 mb-2">
                Sexe
              </label>
              <select
                id="sexe"
                name="sexe"
                value={formData.sexe}
                onChange={handleInputChange}
                className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.sexe ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="H">Homme</option>
                <option value="F">Femme</option>
              </select>
              {errors.sexe && (
                <p className="mt-2 text-sm text-red-600">{errors.sexe}</p>
              )}
            </div>

            {/* Nom complet */}
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
                Nom Complet
              </label>
              <input
                type="text"
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                placeholder="Ex: Jean Dupont"
                className={`block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.nom ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.nom && (
                <p className="mt-2 text-sm text-red-600">{errors.nom}</p>
              )}
            </div>

            {/* Solde initial */}
            <div>
              <label htmlFor="solde" className="block text-sm font-medium text-gray-700 mb-2">
                Solde Initial
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">Ar</span>
                </div>
                <input
                  type="text"
                  id="solde"
                  name="solde"
                  value={formData.solde}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className={`block w-full pl-8 pr-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.solde ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.solde && (
                <p className="mt-2 text-sm text-red-600">{errors.solde}</p>
              )}
            </div>

            {/* Boutons d'action */}
            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Ajout en cours...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    Ajouter le Client
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Annuler
              </button>
            </div>
          </form>
        </div>

        {/* Mention légale */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Toutes les informations bancaires sont chiffrées conformément aux normes de sécurité en vigueur.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            © 2024 AEENI. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AjouterClient;

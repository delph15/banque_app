import React, { useState } from 'react';
import { LogOut, Users, Plus, BarChart3, ArrowLeft, Home, CheckCircle2, Lock, Sun, Moon } from 'lucide-react';
import api from '../services/api';

const AjouterClient = ({ onNavigate, user, onLogout }) => {
  const [formData, setFormData] = useState({
    nom: '',
    sexe: 'H',
    solde: ''
  });
  
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
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
        <div
          className="w-full rounded-3xl overflow-hidden shadow-2xl relative"
          style={{
            background: darkMode
              ? 'linear-gradient(160deg, #0f172a 0%, #0d1424 100%)'
              : 'linear-gradient(160deg, #f8fafc 0%, #e2e8f0 100%)',
            border: darkMode
              ? '1px solid rgba(255,255,255,0.08)'
              : '1px solid rgba(0,0,0,0.08)',
            boxShadow: darkMode
              ? '0 0 0 1px rgba(99,102,241,0.15), 0 32px 80px rgba(0,0,0,0.35), 0 0 80px rgba(99,102,241,0.08)'
              : '0 0 0 1px rgba(99,102,241,0.1), 0 8px 32px rgba(0,0,0,0.12), 0 0 40px rgba(99,102,241,0.04)',
            fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
          }}
        >
          <div
            className="h-1 w-full"
            style={{ background: 'linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6, #ec4899)' }}
          />
          <div className="p-6">
            {/* Toggle mode */}
            <div className="flex justify-end mb-4">
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sexe */}
            <div>
              <label htmlFor="sexe" className={`flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider mb-2 ${
                darkMode ? 'text-slate-400' : 'text-gray-600'
              }`}>
                Genre
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, sexe: 'H' }))}
                  className={`relative flex items-center justify-center h-11 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                    formData.sexe === 'H'
                      ? 'text-white shadow-lg'
                      : darkMode 
                        ? 'text-white/70 hover:text-white' 
                        : 'text-gray-600 hover:text-gray-800'
                  }`}
                  style={{
                    background: formData.sexe === 'H'
                      ? 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)'
                      : darkMode 
                        ? 'rgba(255,255,255,0.05)' 
                        : 'rgba(0,0,0,0.02)',
                    border: formData.sexe === 'H'
                      ? 'none'
                      : darkMode 
                        ? '1px solid rgba(255,255,255,0.1)' 
                        : '1px solid rgba(0,0,0,0.08)',
                    boxShadow: formData.sexe === 'H'
                      ? '0 0 0 1px rgba(99,102,241,0.15), 0 4px 12px rgba(99,102,241,0.2)'
                      : 'none'
                  }}
                >
                  <span className="text-sm font-medium">Masculin</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, sexe: 'F' }))}
                  className={`relative flex items-center justify-center h-11 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                    formData.sexe === 'F'
                      ? 'text-white shadow-lg'
                      : darkMode 
                        ? 'text-white/70 hover:text-white' 
                        : 'text-gray-600 hover:text-gray-800'
                  }`}
                  style={{
                    background: formData.sexe === 'F'
                      ? 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)'
                      : darkMode 
                        ? 'rgba(255,255,255,0.05)' 
                        : 'rgba(0,0,0,0.02)',
                    border: formData.sexe === 'F'
                      ? 'none'
                      : darkMode 
                        ? '1px solid rgba(255,255,255,0.1)' 
                        : '1px solid rgba(0,0,0,0.08)',
                    boxShadow: formData.sexe === 'F'
                      ? '0 0 0 1px rgba(236,72,153,0.15), 0 4px 12px rgba(236,72,153,0.2)'
                      : 'none'
                  }}
                >
                  <span className="text-sm font-medium">Féminin </span>
                </button>
              </div>
              {errors.sexe && (
                <div className="flex items-center gap-1.5 mt-1.5 text-red-400 text-xs">
                  {errors.sexe}
                </div>
              )}
            </div>

            {/* Nom complet */}
            <div>
              <label htmlFor="nom" className={`flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider mb-2 ${
                darkMode ? 'text-slate-400' : 'text-gray-600'
              }`}>
                Nom Complet
              </label>
              <input
                type="text"
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                placeholder="Ex: Jean Dupont"
                className={`w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 ${
                  errors.nom ? 'ring-2 ring-red-500/40' : ''
                } ${
                  darkMode 
                    ? 'text-white placeholder-slate-500' 
                    : 'text-gray-800 placeholder-gray-500'
                }`}
                style={{
                  background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${errors.nom ? 'rgba(239,68,68,0.5)' : (darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)')}`
                }}
              />
              {errors.nom && (
                <div className={`flex items-center gap-1.5 mt-1.5 text-xs ${
                  darkMode ? 'text-red-400' : 'text-red-600'
                }`}>
                  {errors.nom}
                </div>
              )}
            </div>

            {/* Solde initial */}
            <div>
              <label htmlFor="solde" className={`flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider mb-2 ${
                darkMode ? 'text-slate-400' : 'text-gray-600'
              }`}>
                Solde Initial
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className={`text-xs font-semibold ${
                    darkMode ? 'text-slate-400' : 'text-gray-500'
                  }`}>MGA</span>
                </div>
                <input
                  type="text"
                  id="solde"
                  name="solde"
                  value={formData.solde}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className={`w-full pl-14 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 ${
                    errors.solde ? 'ring-2 ring-red-500/40' : ''
                  } ${
                    darkMode 
                      ? 'text-white placeholder-slate-500' 
                      : 'text-gray-800 placeholder-gray-500'
                  }`}
                  style={{
                    background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    border: `1px solid ${errors.solde ? 'rgba(239,68,68,0.5)' : (darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)')}`
                  }}
                />
              </div>
              {errors.solde && (
                <div className={`flex items-center gap-1.5 mt-1.5 text-xs ${
                  darkMode ? 'text-red-400' : 'text-red-600'
                }`}>
                  {errors.solde}
                </div>
              )}
            </div>

            {/* Boutons d'action */}
            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] flex items-center justify-center px-4 py-3 rounded-2xl text-sm font-semibold text-white gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 60%, #8b5cf6 100%)' }}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Ajout en cours...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Ajouter le client
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className={`flex-1 flex items-center justify-center px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
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
                <ArrowLeft className="w-5 h-5 mr-2" />
                Annuler
              </button>
            </div>
          </form>
          <div className={`flex items-center justify-center gap-1.5 text-xs mt-5 ${
            darkMode ? 'text-slate-500' : 'text-gray-500'
          }`}>
            <Lock size={10} />
            <span>Les informations sont sécurisées et tracées.</span>
          </div>
          </div>
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

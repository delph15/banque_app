import React, { useState } from 'react';
import { LogOut, ArrowLeft, Home, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import authService from '../services/auth';

const LoginGerant = ({ onNavigate, onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Le nom d\'utilisateur est requis';
    }
    
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
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
        
        if (isRegister) {
          // Logique d'inscription (à implémenter si nécessaire)
          const agence_id = '1'; // Valeur par défaut
          await authService.register(formData.username, formData.password, agence_id);
          alert('Gérant créé avec succès. Vous pouvez maintenant vous connecter.');
          setIsRegister(false);
          setFormData({ username: '', password: '' });
        } else {
          // Logique de connexion
          const result = await authService.login(formData.username, formData.password);
          onLogin({
            username: formData.username,
            role: 'gerant'
          });
        }
        
        setErrors({});
      } catch (error) {
        console.error('Erreur:', error);
        setErrors({ submit: error.message });
      } finally {
        setLoading(false);
      }
    } else {
      setErrors(newErrors);
    }
  };

  const handleCancel = () => {
    setFormData({ username: '', password: '' });
    setErrors({});
    onNavigate('clients');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-violet-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Home className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isRegister ? 'Créer un compte gérant' : 'Connexion Gérant'}
          </h1>
          <p className="text-gray-600">
            {isRegister 
              ? 'Créez un nouveau compte pour gérer votre agence' 
              : 'Connectez-vous pour accéder à la gestion des clients'
            }
          </p>
        </div>

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

        {/* Formulaire */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nom d'utilisateur */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Nom d'utilisateur
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Entrez votre nom d'utilisateur"
                  className={`block w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.username ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.username && (
                <p className="mt-2 text-sm text-red-600">{errors.username}</p>
              )}
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Entrez votre mot de passe"
                  className={`block w-full pl-10 pr-10 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
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
                    {isRegister ? 'Création...' : 'Connexion...'}
                  </>
                ) : (
                  <>
                    {isRegister ? 'Créer le compte' : 'Se connecter'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Switch entre login et register */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setErrors({});
            }}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            {isRegister 
              ? 'Déjà un compte ? Connectez-vous' 
              : 'Pas de compte ? Créez-en un'
            }
          </button>
        </div>

        {/* Mention légale */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Espace sécurisé pour les gérants d'agence AEENI.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            © 2024 AEENI. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginGerant;

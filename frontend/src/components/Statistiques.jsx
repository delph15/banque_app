import React, { useState, useEffect, useMemo } from 'react';

import { LogOut, TrendingUp, TrendingDown, DollarSign, AlertCircle, Crown, Home, Users } from 'lucide-react';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

import api from '../services/api';



const Statistiques = ({ onNavigate, user, onLogout }) => {

  const [clients, setClients] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);



  useEffect(() => {

    const fetchClients = async () => {

      try {

        setLoading(true);

        const data = await api.getClients();

        setClients(data);

        setError(null);

      } catch (error) {

        console.error('Erreur lors du chargement des clients:', error);

        setError('Impossible de charger les données statistiques');

      } finally {

        setLoading(false);

      }

    };



    fetchClients();

  }, []);



  // Calcul des statistiques

  const stats = useMemo(() => {

    if (clients.length === 0) {

      return {

        total: 0,

        min: 0,

        max: 0,

        totalClients: 0

      };

    }



    const soldes = clients.map(c => parseFloat(c.solde));

    const total = soldes.reduce((sum, solde) => sum + solde, 0);

    const min = Math.min(...soldes);

    const max = Math.max(...soldes);



    return {

      total,

      min,

      max,

      totalClients: clients.length

    };

  }, [clients]);



  const formatCurrency = (amount) => {

    return new Intl.NumberFormat('fr-MG', {

      style: 'currency',

      currency: 'MGA'

    }).format(amount);

  };



  // Données pour l'histogramme (total, min, max)

  const histogramData = useMemo(() => {

    if (clients.length === 0) return [];

    

    const soldes = clients.map(c => parseFloat(c.solde));

    const total = soldes.reduce((sum, solde) => sum + solde, 0);

    const min = Math.min(...soldes);

    const max = Math.max(...soldes);

    

    return [

      { label: 'Total', valeur: total, color: '#3b82f6' },

      { label: 'Minimum', valeur: min, color: '#ef4444' },

      { label: 'Maximum', valeur: max, color: '#10b981' }

    ];

  }, [clients]);



  const CustomTooltip = ({ active, payload }) => {

    if (active && payload && payload.length) {

      return (

        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">

          <p className="text-sm font-medium text-gray-900">

            {payload[0].payload.label}

          </p>

          <p className="text-sm text-gray-600">

            {formatCurrency(payload[0].payload.valeur)}

          </p>

        </div>

      );

    }

    return null;

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

                <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('ajouter'); }} className="text-gray-600 hover:text-gray-900 pb-1">Ajouter</a>

                <a href="#" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1">Statistiques</a>

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

        {/* En-tête de la page */}

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Statistiques</h1>

          <p className="text-gray-600">Analyse des soldes clients et répartition par statut</p>

        </div>



        {/* Loading state */}

        {loading && (

          <div className="flex justify-center items-center py-12">

            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>

            <span className="ml-2 text-gray-600">Chargement des statistiques...</span>

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



        {/* Cartes d'indicateurs (KPIs) */}

        {!loading && !error && (

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

            {/* Nombre de clients */}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm font-medium text-gray-600 mb-1">Nombre de clients</p>

                  <p className="text-2xl font-bold text-gray-900">{stats.totalClients}</p>

                  <div className="flex items-center mt-2">

                    <Users className="w-4 h-4 text-blue-500 mr-1" />

                    <span className="text-sm text-blue-600 font-medium">Total actif</span>

                  </div>

                </div>

                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">

                  <Users className="w-6 h-6 text-blue-600" />

                </div>

              </div>

            </div>



            {/* Solde Total */}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm font-medium text-gray-600 mb-1">Solde Total</p>

                  <p className="text-2xl font-bold text-gray-900">

                    {formatCurrency(stats.total)}

                  </p>

                  <div className="flex items-center mt-2">

                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />

                    <span className="text-sm text-green-600 font-medium">En progression</span>

                  </div>

                </div>

                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">

                  <DollarSign className="w-6 h-6 text-green-600" />

                </div>

              </div>

            </div>



            {/* Solde Minimum */}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm font-medium text-gray-600 mb-1">Solde Minimum</p>

                  <p className="text-2xl font-bold text-red-600">

                    {formatCurrency(stats.min)}

                  </p>

                  <div className="flex items-center mt-2">

                    <AlertCircle className="w-4 h-4 text-red-500 mr-1" />

                    <span className="text-sm text-red-600 font-medium">À surveiller</span>

                  </div>

                </div>

                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">

                  <TrendingDown className="w-6 h-6 text-red-600" />

                </div>

              </div>

            </div>



            {/* Solde Maximum */}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm font-medium text-gray-600 mb-1">Solde Maximum</p>

                  <p className="text-2xl font-bold text-gray-900">

                    {formatCurrency(stats.max)}

                  </p>

                  <div className="flex items-center mt-2">

                    <Crown className="w-4 h-4 text-purple-500 mr-1" />

                    <span className="text-sm text-purple-600 font-medium">Client premium</span>

                  </div>

                </div>

                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">

                  <TrendingUp className="w-6 h-6 text-purple-600" />

                </div>

              </div>

            </div>

          </div>

        )}



        {/* Section Histogramme des valeurs */}

        {!loading && !error && (

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

            <h2 className="text-xl font-semibold text-gray-900 mb-2">Valeurs des Soldes</h2>

            <p className="text-sm text-gray-600 mb-6">Visualisation du solde total, minimum et maximum</p>

            

            <div className="h-80">

              <ResponsiveContainer width="100%" height="100%">

                <BarChart data={histogramData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>

                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

                  <XAxis 

                    dataKey="label" 

                    tick={{ fill: '#6b7280', fontSize: 12 }}

                    axisLine={{ stroke: '#e5e7eb' }}

                  />

                  <YAxis 

                    tick={{ fill: '#6b7280', fontSize: 12 }}

                    axisLine={{ stroke: '#e5e7eb' }}

                  />

                  <Tooltip content={<CustomTooltip />} />

                  <Bar dataKey="valeur" radius={[8, 8, 0, 0]}>

                    {histogramData.map((entry, index) => (

                      <Cell key={`cell-${index}`} fill={entry.color} />

                    ))}

                  </Bar>

                </BarChart>

              </ResponsiveContainer>

            </div>



            {/* Légende */}

            <div className="mt-6 flex flex-wrap gap-4 justify-center">

              {histogramData.map((item, index) => (

                <div key={index} className="flex items-center">

                  <div 

                    className="w-3 h-3 rounded-full mr-2" 

                    style={{ backgroundColor: item.color }}

                  />

                  <span className="text-sm text-gray-600">

                    {item.label}: {formatCurrency(item.valeur)}

                  </span>

                </div>

              ))}

            </div>

          </div>

        )}



        {/* Résumé additionnel */}

        {!loading && !error && (

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

              <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par statut</h3>

              <div className="space-y-3">

                <div className="flex justify-between items-center">

                  <span className="text-sm text-gray-600">Comptes Insuffisants (&lt;1000€)</span>

                  <span className="text-sm font-medium text-red-600">

                    {clients.filter(c => parseFloat(c.solde) < 1000).length}

                  </span>

                </div>

                <div className="flex justify-between items-center">

                  <span className="text-sm text-gray-600">Comptes Moyens (1000-5000€)</span>

                  <span className="text-sm font-medium text-yellow-600">

                    {clients.filter(c => parseFloat(c.solde) >= 1000 && parseFloat(c.solde) <= 5000).length}

                  </span>

                </div>

                <div className="flex justify-between items-center">

                  <span className="text-sm text-gray-600">Comptes Élevés (&gt;5000€)</span>

                  <span className="text-sm font-medium text-green-600">

                    {clients.filter(c => parseFloat(c.solde) > 5000).length}

                  </span>

                </div>

              </div>

            </div> */}



            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations générales</h3>

              <div className="space-y-3">

                <div className="flex justify-between items-center">

                  <span className="text-sm text-gray-600">Total clients</span>

                  <span className="text-sm font-medium text-gray-900">{stats.totalClients}</span>

                </div>

                <div className="flex justify-between items-center">

                  <span className="text-sm text-gray-600">Solde moyen</span>

                  <span className="text-sm font-medium text-gray-900">

                    {formatCurrency(stats.total / stats.totalClients)}

                  </span>

                </div>

                <div className="flex justify-between items-center">

                  <span className="text-sm text-gray-600">Clients en découvert</span>

                  <span className="text-sm font-medium text-red-600">

                    {clients.filter(c => parseFloat(c.solde) < 0).length}

                  </span>

                </div>

              </div>

            </div>

          </div>

        )}

      </div>

    </div>

  );

};



export default Statistiques;


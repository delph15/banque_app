import React, { useState, useMemo } from 'react';
import { LogOut, TrendingUp, TrendingDown, DollarSign, AlertCircle, Crown, Home } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Statistiques = ({ onNavigate, user, onLogout }) => {
  // Données simulées des clients
  const [clients] = useState([
    { id: 1, numCompte: 'AEENI001', nom: 'Jean Dupont', solde: 2500 },
    { id: 2, numCompte: 'AEENI002', nom: 'Marie Martin', solde: 850 },
    { id: 3, numCompte: 'AEENI003', nom: 'Pierre Bernard', solde: 6000 },
    { id: 4, numCompte: 'AEENI004', nom: 'Sophie Petit', solde: 3200 },
    { id: 5, numCompte: 'AEENI005', nom: 'Lucas Dubois', solde: -450 },
    { id: 6, numCompte: 'AEENI006', nom: 'Emma Leroy', solde: 85200 },
    { id: 7, numCompte: 'AEENI007', nom: 'Nicolas Moreau', solde: 1200 },
    { id: 8, numCompte: 'AEENI008', nom: 'Camille Bernard', solde: 4800 },
    { id: 9, numCompte: 'AEENI009', nom: 'Thomas Petit', solde: 750 },
    { id: 10, numCompte: 'AEENI010', nom: 'Julie Martin', solde: 15000 },
    { id: 11, numCompte: 'AEENI011', nom: 'Antoine Dubois', solde: 3500 },
    { id: 12, numCompte: 'AEENI012', nom: 'Léa Leroy', solde: 9200 },
  ]);

  // Calcul des statistiques
  const stats = useMemo(() => {
    const soldes = clients.map(c => c.solde);
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

  // Distribution des soldes par tranche
  const distributionData = useMemo(() => {
    const tranches = [
      { label: '< 0', min: -Infinity, max: 0, color: '#ef4444' },
      { label: '0-1000', min: 0, max: 1000, color: '#f59e0b' },
      { label: '1000-5000', min: 1000, max: 5000, color: '#3b82f6' },
      { label: '5000-10000', min: 5000, max: 10000, color: '#10b981' },
      { label: '> 10000', min: 10000, max: Infinity, color: '#8b5cf6' }
    ];

    return tranches.map(tranche => {
      const count = clients.filter(c => 
        c.solde >= tranche.min && c.solde < tranche.max
      ).length;
      
      return {
        tranche: tranche.label,
        nombre: count,
        color: tranche.color
      };
    });
  }, [clients]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">
            Tranche: {payload[0].payload.tranche}
          </p>
          <p className="text-sm text-gray-600">
            Clients: {payload[0].value}
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Statistiques - AEENI</h1>
          <p className="text-gray-600">Répartition des clients selon leur solde bancaire et indicateurs globaux du projet.</p>
        </div>

        {/* Cartes d'indicateurs (KPIs) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                  <span className="text-sm text-green-600 font-medium">+4.2% ce mois</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
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
                  <span className="text-sm text-red-600 font-medium">Découvert atteint</span>
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
                  <span className="text-sm text-purple-600 font-medium">Segment Premium</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Section Distribution des Soldes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Distribution des Soldes</h2>
          <p className="text-sm text-gray-600 mb-6">Nombre de clients par tranche de capital</p>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="tranche" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="nombre" radius={[8, 8, 0, 0]}>
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Légende */}
          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            {distributionData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-600">
                  {item.tranche}: {item.nombre} client{item.nombre > 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Résumé additionnel */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par statut</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Comptes Insuffisants (&lt;1000€)</span>
                <span className="text-sm font-medium text-red-600">
                  {clients.filter(c => c.solde < 1000).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Comptes Moyens (1000-5000€)</span>
                <span className="text-sm font-medium text-yellow-600">
                  {clients.filter(c => c.solde >= 1000 && c.solde <= 5000).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Comptes Élevés (&gt;5000€)</span>
                <span className="text-sm font-medium text-green-600">
                  {clients.filter(c => c.solde > 5000).length}
                </span>
              </div>
            </div>
          </div>

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
                  {clients.filter(c => c.solde < 0).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistiques;

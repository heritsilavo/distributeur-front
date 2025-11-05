"use client";
import { useEffect, useState } from "react";
import { AlertCircle, Calendar, CreditCard, DollarSign, FileText, Filter, Search } from "lucide-react";

interface Transaction {
  id: number;
  detail: string;
  montant: number;
  mode: string;
  dateTime: string;
}

export default function HistoriquePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterMode, setFilterMode] = useState<string>("tous");

  useEffect(() => {
    fetch("http://localhost:8080/api/v1/transactions")
      .then(async (res) => {
        if (!res.ok) throw new Error("Erreur serveur");
        const data = await res.json();
        console.log("Réponse backend:", data); 
        if (Array.isArray(data)) {
          setTransactions(data);
          setFilteredTransactions(data);
        } else {
          setError("Format inattendu reçu du serveur");
        }
      })
      .catch((err) => {
        console.error("Erreur de récupération:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let filtered = transactions;

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(tx => 
        tx.detail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.id.toString().includes(searchTerm)
      );
    }

    // Filtre par mode de paiement
    if (filterMode !== "tous") {
      filtered = filtered.filter(tx => tx.mode === filterMode);
    }

    setFilteredTransactions(filtered);
  }, [searchTerm, filterMode, transactions]);

  const totalMontant = filteredTransactions.reduce((sum, tx) => sum + tx.montant, 0);
  const modesUniques = [...new Set(transactions.map(tx => tx.mode))];

  const getModeColor = (mode: string) => {
    const colors: { [key: string]: string } = {
      'Espèces': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
      'Carte': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
      'Mobile': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
      'Chèque': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    };
    return colors[mode] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Chargement des transactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-red-200 dark:border-red-800 p-6 max-w-md w-full transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center transition-colors">
              <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Erreur</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 transition-colors">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Historique des ventes</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Consultez toutes vos transactions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center transition-colors">
                <FileText className="text-blue-600 dark:text-blue-400" size={20} />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Total transactions</h3>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
              {filteredTransactions.length}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center transition-colors">
                <DollarSign className="text-green-600 dark:text-green-400" size={20} />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Montant total</h3>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
              {totalMontant.toLocaleString()} Ar
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center transition-colors">
                <CreditCard className="text-purple-600 dark:text-purple-400" size={20} />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Modes de paiement</h3>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
              {modesUniques.length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6 transition-colors">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Rechercher par ID ou détail..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Filter by payment mode */}
            <div className="md:w-64">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <select
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all"
                  value={filterMode}
                  onChange={(e) => setFilterMode(e.target.value)}
                >
                  <option value="tous">Tous les modes</option>
                  {modesUniques.map(mode => (
                    <option key={mode} value={mode}>{mode}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden transition-colors">
          {filteredTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                <FileText className="text-gray-400" size={24} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">Aucune transaction</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || filterMode !== "tous" 
                  ? "Aucun résultat ne correspond à vos critères" 
                  : "Les transactions apparaîtront ici"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 transition-colors">
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-200">
                      ID
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-200">
                      Détail
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-200">
                      Montant
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-200">
                      Mode de paiement
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-200">
                      Date et heure
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                        #{tx.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {tx.detail}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {tx.montant.toLocaleString()} Ar
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getModeColor(tx.mode)}`}>
                          {tx.mode}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          {new Date(tx.dateTime).toLocaleString('fr-FR', {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer info */}
        {filteredTransactions.length > 0 && (
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            Affichage de {filteredTransactions.length} transaction(s)
            {(searchTerm || filterMode !== "tous") && ` sur ${transactions.length} au total`}
          </div>
        )}
      </div>
    </div>
  );
}
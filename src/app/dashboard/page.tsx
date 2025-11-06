"use client";

import { useEffect, useState } from "react";
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  Bar,
  BarChart,
  ComposedChart,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { TrendingUp, ShoppingCart, Clock, Package } from "lucide-react";

interface BoissonData {
  name: string;
  montant: number;
  quantite: number;
}

interface VenteParDate {
  date: string;
  nombreVentes: number;
  montantTotal: number;
  nombreBoissons: number;
}

interface VenteParMode {
  mode: string;
  montant: number;
  [key: string]: string | number; // Index signature pour résoudre l'erreur
}

interface PieLabelProps {
  mode: string;
  montant: number;
  percent: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function DashboardPage() {
  const [totalVentes, setTotalVentes] = useState<number>(0);
  const [nombreTotalVentes, setNombreTotalVentes] = useState<number>(0);
  const [totalBoissonsVendues, setTotalBoissonsVendues] = useState<number>(0);
  const [dataBoisson, setDataBoisson] = useState<BoissonData[]>([]);
  const [dataVentesParDate, setDataVentesParDate] = useState<VenteParDate[]>([]);
  const [dataVentesParMode, setDataVentesParMode] = useState<VenteParMode[]>([]);
  const [now, setNow] = useState<string>("");

  const load = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/v1/dashboard/stats");
      const json = await res.json();
      
      setTotalVentes(json.totalVentes || 0);
      setNombreTotalVentes(json.nombreTotalVentes || 0);
      setTotalBoissonsVendues(json.totalBoissonsVendues || 0);

      // Graphique 1 : montant et quantité par boisson
      const montantParBoisson = json.montantParBoisson || {};
      const quantiteParBoisson = json.quantiteParBoisson || {};
      
      const parsedBoisson = Object.keys(montantParBoisson).map(name => ({
        name,
        montant: Number(montantParBoisson[name] || 0),
        quantite: Number(quantiteParBoisson[name] || 0)
      }));
      setDataBoisson(parsedBoisson);

      // Graphique 2 : ventes par jour (nombre, montant, boissons)
      const parsedVentesParDate = Object.entries(json.ventesParDate || {}).map(([date, stats]: [string, any]) => ({
        date,
        nombreVentes: Number(stats.nombreVentes || 0),
        montantTotal: Number(stats.montantTotal || 0),
        nombreBoissons: Number(stats.nombreBoissons || 0)
      }));
      setDataVentesParDate(parsedVentesParDate);

      // Graphique 3 : ventes par mode de paiement
      const ventesParMode = json.ventesParMode || {};
      const parsedVentesParMode: VenteParMode[] = Object.entries(ventesParMode).map(([mode, montant]) => ({
        mode: mode === 'CASH' ? 'Espèces' : mode === 'QR' ? 'QR Code' : mode,
        montant: Number(montant)
      }));
      setDataVentesParMode(parsedVentesParMode);

      setNow(new Date().toLocaleString('fr-FR', {
        dateStyle: 'short',
        timeStyle: 'short'
      }));
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Fonction de rendu pour les labels du PieChart
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }: any) => {
    if (!percent) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Données pour le graphique des boissons (top 5 par montant)
  const topBoissons = [...dataBoisson]
    .sort((a, b) => b.montant - a.montant)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 transition-colors">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Tableau de bord</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Vue d'ensemble des ventes et statistiques</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center transition-colors">
                <TrendingUp className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
            </div>
            <h2 className="text-sm font-medium text-gray-600 dark:text-gray-300">Total des ventes</h2>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-2">
              {totalVentes.toLocaleString()} Ar
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center transition-colors">
                <ShoppingCart className="text-green-600 dark:text-green-400" size={24} />
              </div>
            </div>
            <h2 className="text-sm font-medium text-gray-600 dark:text-gray-300">Nombre de ventes</h2>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-2">
              {nombreTotalVentes.toLocaleString()}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center transition-colors">
                <Package className="text-orange-600 dark:text-orange-400" size={24} />
              </div>
            </div>
            <h2 className="text-sm font-medium text-gray-600 dark:text-gray-300">Boissons vendues</h2>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-2">
              {totalBoissonsVendues.toLocaleString()}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center transition-colors">
                <Clock className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
            </div>
            <h2 className="text-sm font-medium text-gray-600 dark:text-gray-300">Dernière mise à jour</h2>
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mt-2">{now}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Top boissons par montant */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6 transition-colors">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Top 5 des boissons</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Montant total généré par produit</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topBoissons}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-600" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                  className="dark:stroke-gray-400"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                  className="dark:stroke-gray-400"
                  tickFormatter={(value) => `${value.toLocaleString()} Ar`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: '#1f2937'
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === "montant") {
                      return [`${value.toLocaleString()} Ar`, "Montant"];
                    }
                    return [value, "Quantité vendue"];
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="montant" 
                  fill="#3b82f6" 
                  name="Montant total"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 2: Ventes par mode de paiement */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6 transition-colors">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Ventes par mode de paiement</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Répartition du chiffre d'affaires</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dataVentesParMode}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="montant"
                  nameKey="mode"
                >
                  {dataVentesParMode.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: '#1f2937'
                  }}
                  formatter={(value: number) => [`${value.toLocaleString()} Ar`, "Montant"]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Ventes quotidiennes détaillées */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6 transition-colors">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Ventes quotidiennes détaillées</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Évolution des ventes sur la période</p>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={dataVentesParDate}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-600" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
                className="dark:stroke-gray-400"
              />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
                className="dark:stroke-gray-400"
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
                className="dark:stroke-gray-400"
                tickFormatter={(value) => `${value.toLocaleString()} Ar`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  color: '#1f2937'
                }}
                formatter={(value: number, name: string) => {
                  if (name === "montantTotal") {
                    return [`${value.toLocaleString()} Ar`, "Montant total"];
                  } else if (name === "nombreBoissons") {
                    return [value, "Nombre de boissons"];
                  }
                  return [value, "Nombre de ventes"];
                }}
              />
              <Legend />
              <Bar 
                yAxisId="left"
                dataKey="nombreVentes" 
                fill="#10b981" 
                name="Nombre de ventes"
                radius={[8, 8, 0, 0]}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="montantTotal" 
                stroke="#f59e0b" 
                strokeWidth={2}
                name="Montant total (Ar)"
                dot={{ fill: '#f59e0b', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="nombreBoissons" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                name="Nombre de boissons"
                dot={{ fill: '#8b5cf6', r: 4 }}
                activeDot={{ r: 6 }}
                strokeDasharray="3 3"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Tableau détaillé des boissons */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6 transition-colors">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Détail des ventes par boisson</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Performance détaillée de chaque produit</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3">Boisson</th>
                  <th className="px-4 py-3 text-right">Quantité vendue</th>
                  <th className="px-4 py-3 text-right">Montant total</th>
                  <th className="px-4 py-3 text-right">Prix moyen</th>
                </tr>
              </thead>
              <tbody>
                {dataBoisson
                  .sort((a, b) => b.montant - a.montant)
                  .map((boisson, index) => (
                    <tr key={boisson.name} className="border-b dark:border-gray-700">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {boisson.name}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {boisson.quantite.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {boisson.montant.toLocaleString()} Ar
                      </td>
                      <td className="px-4 py-3 text-right">
                        {boisson.quantite > 0 
                          ? (boisson.montant / boisson.quantite).toLocaleString(undefined, {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0
                            }) + ' Ar'
                          : '0 Ar'
                        }
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
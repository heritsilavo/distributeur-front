"use client";

import { useEffect, useState } from "react";
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  Bar,
  BarChart
} from "recharts";
import { TrendingUp, Package, Clock } from "lucide-react";

interface BoissonData {
  name: string;
  montant: number;
}

interface DateData {
  date: string;
  count: number;
}

export default function DashboardPage() {
  const [total, setTotal] = useState<number>(0);
  const [dataBoisson, setDataBoisson] = useState<BoissonData[]>([]);
  const [dataDate, setDataDate] = useState<DateData[]>([]);
  const [now, setNow] = useState<string>("");

  const load = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/v1/dashboard/stats");
      const json = await res.json();
      setTotal(json.total || 0);

      // Graphique 1 : montant par boisson
      const parsedBoisson = Object.entries(json.parBoisson || {}).map(([name, montant]) => ({
        name,
        montant: Number(montant),
      }));
      setDataBoisson(parsedBoisson);

      // Graphique 2 : nombre de transactions par jour
      const parsedDate = Object.entries(json.parDate || {}).map(([date, count]) => ({
        date,
        count: Number(count),
      }));
      setDataDate(parsedDate);

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

  const totalBoissonsVendues = dataDate.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-500 mt-1">Vue d'ensemble des ventes et statistiques</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-blue-600" size={24} />
              </div>
            </div>
            <h2 className="text-sm font-medium text-gray-600">Total des ventes</h2>
            <p className="text-3xl font-semibold text-gray-900 mt-2">
              {total.toLocaleString()} Ar
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="text-green-600" size={24} />
              </div>
            </div>
            <h2 className="text-sm font-medium text-gray-600">Boissons vendues</h2>
            <p className="text-3xl font-semibold text-gray-900 mt-2">
              {totalBoissonsVendues}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="text-purple-600" size={24} />
              </div>
            </div>
            <h2 className="text-sm font-medium text-gray-600">Dernière mise à jour</h2>
            <p className="text-lg font-medium text-gray-900 mt-2">{now}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Montant par boisson */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Ventes par boisson</h2>
              <p className="text-sm text-gray-500 mt-1">Montant total généré par produit</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dataBoisson}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => `${value.toLocaleString()} Ar`}
                />
                <Bar 
                  dataKey="montant" 
                  fill="#3b82f6" 
                  name="Montant"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 2: Ventes par jour */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Ventes quotidiennes</h2>
              <p className="text-sm text-gray-500 mt-1">Nombre de boissons vendues par jour</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dataDate}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Quantité"
                  dot={{ fill: '#10b981', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
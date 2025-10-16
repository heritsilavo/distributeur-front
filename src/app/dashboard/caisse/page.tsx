"use client";

import { useEffect, useState } from "react";

export default function CaissePage() {
  const [caisse, setCaisse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [monnaie, setMonnaie] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  const SEUILS_ALERTE: Record<string, number> = {
    "500": 8,
    "1000": 5,
    "2000": 3,
    "5000": 2,
  };

  const fetchCaisse = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/v1/caisse");
      const data = await res.json();
      setCaisse(data);
      setMonnaie(data.monnaieRendue || {});
    } catch (err) {
      console.error("Erreur lors du chargement:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaisse();
  }, []);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" });
    }, 3000);
  };

  const getStocksBas = () => {
    const stocksBas: Array<{ denomination: string; quantite: number; seuil: number }> = [];
    
    Object.entries(SEUILS_ALERTE).forEach(([denomination, seuil]) => {
      const quantite = monnaie[denomination] || 0;
      if (quantite < seuil) {
        stocksBas.push({ denomination, quantite, seuil });
      }
    });
    
    return stocksBas;
  };

  const stocksBas = getStocksBas();

  const handleChange = (key: string, value: string) => {
    setMonnaie({
      ...monnaie,
      [key]: Number(value) || 0,
    });
  };

  const saveMonnaie = async () => {
    setSaving(true);
    try {
      const res = await fetch("http://localhost:8080/api/v1/caisse/monnaie", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(monnaie),
      });
      
      if (!res.ok) {
        throw new Error("Erreur lors de la mise à jour");
      }

      await fetchCaisse();
      
      showNotification("Monnaie mise à jour avec succès !", "success");
    } catch (err) {
      showNotification("Erreur lors de la mise à jour", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-600">Chargement...</div>;
  if (!caisse || caisse.error)
    return (
      <div className="p-6 text-red-600">
        {caisse?.error || "Erreur de chargement"}
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      {/* Notification discrète */}
      {notification.show && (
        <div
          className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out z-50 ${
            notification.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Alerte stocks bas */}
      {stocksBas.length > 0 && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg shadow-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-orange-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-semibold text-orange-800">
                ⚠️ Stock de monnaie faible
              </h3>
              <div className="mt-2 text-sm text-orange-700">
                <ul className="list-disc list-inside space-y-1">
                  {stocksBas.map((stock) => (
                    <li key={stock.denomination}>
                      <span className="font-medium">{stock.denomination} Ar</span> : 
                      <span className="text-orange-900 font-bold"> {stock.quantite}</span> 
                      <span className="text-gray-600"> (seuil : {stock.seuil})</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold">💰 Caisse du Distributeur</h1>

      <div className="grid grid-cols-2 gap-6">
        {/* Caisse liquide */}
        <div className="p-4 rounded-2xl bg-white shadow">
          <h2 className="text-xl font-semibold mb-2">💵 Argent Liquide</h2>
          <pre className="bg-gray-50 p-2 rounded text-sm overflow-auto">
            {JSON.stringify(caisse.caisseLiquide || {}, null, 2)}
          </pre>
          <p className="mt-2 font-bold text-green-700">
            Total liquide : {caisse.caisseLiquideTotal.toFixed(2)} Ar
          </p>
        </div>

        {/* Caisse QR */}
        <div className="p-4 rounded-2xl bg-white shadow">
          <h2 className="text-xl font-semibold mb-2">💳 Argent QR</h2>
          <p className="text-gray-700">
            Total QR : <b>{caisse.caisseVirtuelle.toFixed(2)} Ar</b>
          </p>
        </div>

        {/* Total */}
        <div className="col-span-2 p-4 bg-green-100 rounded-2xl text-center shadow">
          <h2 className="text-xl font-semibold mb-1">💰 Total Général</h2>
          <p className="text-2xl font-bold">{caisse.total.toFixed(2)} Ar</p>
        </div>

        {/* Monnaie à rendre */}
        <div className="col-span-2 p-4 rounded-2xl bg-yellow-50 shadow space-y-4">
          <h2 className="text-xl font-semibold mb-2">🪙 Réserve de Monnaie</h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {["500", "1000", "2000", "5000"].map((b) => {
              const quantite = monnaie[b] || 0;
              const seuil = SEUILS_ALERTE[b] || 0;
              const estBas = quantite < seuil;
              
              return (
                <div key={b} className="flex flex-col relative">
                  <label className="text-sm text-gray-600 font-medium mb-1">
                    {b} Ar
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={quantite}
                    onChange={(e) => handleChange(b, e.target.value)}
                    className={`border rounded p-2 text-center focus:ring-2 focus:border-transparent transition-all ${
                      estBas
                        ? "border-orange-400 bg-orange-50 focus:ring-orange-500"
                        : "border-gray-300 focus:ring-yellow-500"
                    }`}
                  />
                  {estBas && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500 text-white text-xs items-center justify-center">
                        !
                      </span>
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={saveMonnaie}
            disabled={saving}
            className="mt-4 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-xl shadow transition-colors duration-200"
          >
            {saving ? "💾 Enregistrement..." : "✅ Sauvegarder la monnaie"}
          </button>

          <p className="mt-2 font-bold text-yellow-700">
            Total monnaie : {caisse.monnaieRendueTotal.toFixed(2)} Ar
          </p>
        </div>
      </div>
    </div>
  );
}
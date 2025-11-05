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
    setMonnaie({ ...monnaie, [key]: Number(value) || 0 });
  };

  const saveMonnaie = async () => {
    setSaving(true);
    try {
      const res = await fetch("http://localhost:8080/api/v1/caisse/monnaie", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(monnaie),
      });
      if (!res.ok) throw new Error("Erreur lors de la mise à jour");
      await fetchCaisse();
      showNotification("Monnaie mise à jour avec succès !", "success");
    } catch (err) {
      showNotification("Erreur lors de la mise à jour", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="p-6 text-gray-600 dark:text-gray-300">Chargement...</div>
    );
  if (!caisse || caisse.error)
    return (
      <div className="p-6 text-red-600 dark:text-red-400">
        {caisse?.error || "Erreur de chargement"}
      </div>
    );

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      {/* Notification */}
      {notification.show && (
        <div
          className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 ${notification.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
            }`}
        >
          {notification.message}
        </div>
      )}

      {/* Alertes monnaie faible */}
      {stocksBas.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900 border-l-4 border-orange-500 dark:border-orange-400 p-4 rounded-lg shadow-md transition-colors">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-orange-500 dark:text-orange-300"
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
              <h3 className="text-sm font-semibold text-orange-800 dark:text-orange-200">
                ⚠️ Stock de monnaie faible
              </h3>
              <ul className="mt-2 text-sm text-orange-700 dark:text-orange-300 list-disc list-inside space-y-1">
                {stocksBas.map((stock) => (
                  <li key={stock.denomination}>
                    <span className="font-medium">{stock.denomination} Ar</span>:{" "}
                    <span className="font-bold">{stock.quantite}</span>{" "}
                    <span className="text-gray-600 dark:text-gray-400">
                      (seuil : {stock.seuil})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        💰 Caisse du Distributeur
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Argent liquide */}
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg transition-colors">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
            💵 Argent Liquide
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {caisse.caisseLiquide.map((item: { monaie: number; quantite: number }, index: number) => {
              const isLow = item.quantite < 3; // exemple seuil
              return (
                <div
                  key={index}
                  className={`flex flex-col items-center p-3 rounded-xl border transition-colors ${isLow
                      ? "border-red-400 bg-red-50 dark:bg-red-900 dark:border-red-400"
                      : "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                    }`}
                >
                  <span className="text-gray-700 dark:text-gray-200 font-medium text-lg">
                    {item.monaie.toLocaleString()} Ar
                  </span>
                  <span
                    className={`mt-1 font-bold text-lg ${isLow ? "text-red-600 dark:text-red-400" : "text-green-700 dark:text-green-400"
                      }`}
                  >
                    {item.quantite}
                  </span>
                  {isLow && (
                    <span className="mt-1 text-xs text-red-500 dark:text-red-300">⚠️ faible</span>
                  )}
                </div>
              );
            })}
          </div>

          <p className="mt-4 font-bold text-green-700 dark:text-green-400 text-lg">
            Total liquide : {caisse.caisseLiquideTotal.toLocaleString()} Ar
          </p>
        </div>


        {/* Argent QR         */}
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 shadow transition-colors">
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
            💳 Argent QR
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            Total QR : <b>{caisse.caisseVirtuelle.toFixed(2)} Ar</b>
          </p>
        </div>

        {/* Total Général */}
        <div className="col-span-1 md:col-span-2 p-4 bg-green-100 dark:bg-green-900 rounded-2xl text-center shadow transition-colors">
          <h2 className="text-xl font-semibold mb-1 text-gray-900 dark:text-gray-100">
            💰 Total Général
          </h2>
          <p className="text-2xl font-bold text-green-800 dark:text-green-300">
            {caisse.total.toFixed(2)} Ar
          </p>
        </div>

        {/* Monnaie à rendre */}
        <div className="col-span-1 md:col-span-2 p-4 rounded-2xl bg-yellow-50 dark:bg-yellow-900 shadow space-y-4 transition-colors">
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
            🪙 Réserve de Monnaie
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {["500", "1000", "2000", "5000"].map((b) => {
              const quantite = monnaie[b] || 0;
              const seuil = SEUILS_ALERTE[b] || 0;
              const estBas = quantite < seuil;

              return (
                <div key={b} className="flex flex-col relative">
                  <label className="text-sm text-gray-700 dark:text-gray-200 font-medium mb-1">
                    {b} Ar
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={quantite}
                    onChange={(e) => handleChange(b, e.target.value)}
                    className={`border rounded p-2 text-center focus:ring-2 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${estBas
                        ? "border-orange-400 dark:border-orange-300 focus:ring-orange-500"
                        : "border-gray-300 dark:border-gray-600 focus:ring-yellow-500"
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
            className="mt-4 bg-yellow-500 dark:bg-yellow-600 hover:bg-yellow-600 dark:hover:bg-yellow-500 disabled:bg-gray-400 text-white px-6 py-2 rounded-xl shadow transition-colors duration-200"
          >
            {saving ? "💾 Enregistrement..." : "✅ Sauvegarder la monnaie"}
          </button>

          <p className="mt-2 font-bold text-yellow-700 dark:text-yellow-300">
            Total monnaie : {caisse.monnaieRendueTotal.toFixed(2)} Ar
          </p>
        </div>
      </div>
    </div>
  );
}

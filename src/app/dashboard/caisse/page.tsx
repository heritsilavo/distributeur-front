"use client";

import { ModalAjouterMonnaies } from "@/components/ModalAjouterMonaie/ModalAjouterMonaie";
import { ModalRetirerMonnaies } from "@/components/ModalRetirerMonnaies/ModalRetirerMonnaies";
import { useEffect, useState } from "react";

export default function CaissePage() {
  const [caisse, setCaisse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModalAjouter, setShowModalAjouter] = useState(false);
  const [showModalRetirer, setShowModalRetirer] = useState(false);
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

  const ajouterMonnaiesReserve = async (monnaiesValides: Array<{ valeur: string; quantite: string }>) => {
    if (monnaiesValides.length === 0) {
      showNotification("Veuillez remplir au moins une ligne valide", "error");
      return;
    }

    console.log("Monnaies à ajouter:", monnaiesValides);
    var ajoutDto = monnaiesValides.map(item => ({
      monaie: parseInt(item.valeur),
      quantite: parseInt(item.quantite)
    }));

    try {
      const res = await fetch("http://localhost:8080/api/v1/caisse/ajouterMonaieReserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ajoutDto),
      });
      if (!res.ok) throw new Error("Erreur lors de l'ajout");
      await fetchCaisse();
      showNotification("Monnaies ajoutées avec succès !", "success");
      setShowModalAjouter(false);
    } catch (err) {
      showNotification("Erreur lors de l'ajout", "error");
    }
  };

  const retirerMonnaies = async (data: any) => {
    console.log("Données de retrait:", data);

    try {
      const res = await fetch("http://localhost:8080/api/v1/caisse/retierMonnaie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erreur lors du retrait");
      await fetchCaisse();
      showNotification("Monnaies retirées avec succès !", "success");
      setShowModalRetirer(false);
    } catch (err) {
      showNotification("Erreur lors du retrait", "error");
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          💰 Caisse du Distributeur
        </h1>
        <button
          onClick={() => setShowModalAjouter(true)}
          className="bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-500 text-white px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 font-semibold"
        >
          <span className="text-xl">➕</span>
          Ajouter des monnaies
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Argent liquide */}
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg transition-colors">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
            💵 Argent Liquide
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {caisse.caisseLiquide.map((item: { monaie: number; quantite: number }, index: number) => {
              const isLow = item.quantite < 3;
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

        {/* Reserve de monnaie */}
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg transition-colors">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
            🪙 Réserve de Monnaie
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {caisse.monnaieRendue.map((item: { monaie: number; quantite: number }, index: number) => {
              const seuil = SEUILS_ALERTE[item.monaie.toString()] || 0;
              const isLow = item.quantite < seuil;
              return (
                <div
                  key={index}
                  className={`flex flex-col items-center p-3 rounded-xl border transition-colors ${isLow
                    ? "border-orange-400 bg-orange-50 dark:bg-orange-900 dark:border-orange-400"
                    : "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                    }`}
                >
                  <span className="text-gray-700 dark:text-gray-200 font-medium text-lg">
                    {item.monaie.toLocaleString()} Ar
                  </span>
                  <span
                    className={`mt-1 font-bold text-lg ${isLow ? "text-orange-600 dark:text-orange-400" : "text-green-700 dark:text-green-400"
                      }`}
                  >
                    {item.quantite}
                  </span>
                  {isLow && (
                    <span className="mt-1 text-xs text-orange-500 dark:text-orange-300">⚠️ faible</span>
                  )}
                </div>
              );
            })}
          </div>

          <p className="mt-4 font-bold text-yellow-700 dark:text-yellow-400 text-lg">
            Total réserve : {caisse.monnaieRendueTotal.toLocaleString()} Ar
          </p>
        </div>

        {/* Total Général avec bouton Retirer */}
        <div className="col-span-1 md:col-span-2 space-y-3">

          <button
            onClick={() => setShowModalRetirer(true)}
            className="w-full bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 font-semibold"
          >
            <span className="text-xl">➖</span>
            Retirer des monnaies
          </button>

          <div className="p-6 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-2xl text-center shadow-lg transition-colors">
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
              💰 Total Général
            </h2>
            <p className="text-3xl font-bold text-green-800 dark:text-green-300">
              {caisse.total.toLocaleString()} Ar
            </p>
          </div>

        </div>
      </div>

      {/* Modals */}
      <ModalAjouterMonnaies
        show={showModalAjouter}
        onClose={() => setShowModalAjouter(false)}
        onAdd={ajouterMonnaiesReserve}
      />

      <ModalRetirerMonnaies
        show={showModalRetirer}
        onClose={() => setShowModalRetirer(false)}
        onRetirer={retirerMonnaies}
        caisse={caisse}
      />
    </div>
  );
}
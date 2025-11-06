"use client";

import { ModalAjouterMonnaies } from "@/components/ModalAjouterMonaie/ModalAjouterMonaie";
import { ModalRetirerMonnaies } from "@/components/ModalRetirerMonnaies/ModalRetirerMonnaies";
import { useEffect, useState, useCallback } from "react";

interface MonaieItem {
  monaie: number;
  quantite: number;
}

interface CaisseData {
  idDist: number;
  caisseLiquide: MonaieItem[];
  caisseLiquideTotal: number;
  monnaieRendue: MonaieItem[];
  monnaieRendueTotal: number;
  caisseVirtuelle: number;
  total: number;
  error?: string;
}

interface MonnaieAjout {
  valeur: string;
  quantite: string;
}

interface Notification {
  show: boolean;
  message: string;
  type: "success" | "error" | "info";
}

const SEUILS_ALERTE: Record<string, number> = {
  "500": 8,
  "1000": 5,
  "2000": 3,
  "5000": 2,
  "10000": 1,
  "20000": 1,
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function CaissePage() {
  const [caisse, setCaisse] = useState<CaisseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModalAjouter, setShowModalAjouter] = useState(false);
  const [showModalRetirer, setShowModalRetirer] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const [notification, setNotification] = useState<Notification>({
    show: false,
    message: "",
    type: "success",
  });

  const fetchCaisse = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/caisse`);
      if (!res.ok) {
        throw new Error(`Erreur HTTP: ${res.status}`);
      }
      const data = await res.json();
      setCaisse(data);
    } catch (err) {
      console.error("Erreur lors du chargement:", err);
      showNotification(
        "Erreur lors du chargement de la caisse",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCaisse();
  }, [fetchCaisse]);

  const showNotification = useCallback(
    (message: string, type: Notification["type"]) => {
      setNotification({ show: true, message, type });
      setTimeout(() => {
        setNotification({ show: false, message: "", type: "success" });
      }, 3000);
    },
    []
  );

  const handleCloseModalAjouter = useCallback(() => {
    setShowModalAjouter(false);
    setTimeout(() => setModalKey((prev) => prev + 1), 300);
  }, []);

  const handleCloseModalRetirer = useCallback(() => {
    setShowModalRetirer(false);
    setTimeout(() => setModalKey((prev) => prev + 1), 300);
  }, []);

  const ajouterMonnaiesReserve = async (monnaiesValides: MonnaieAjout[]) => {
    if (monnaiesValides.length === 0) {
      showNotification("Veuillez remplir au moins une ligne valide", "error");
      return;
    }

    const ajoutDto = monnaiesValides.map((item) => ({
      monaie: parseInt(item.valeur),
      quantite: parseInt(item.quantite),
    }));

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/caisse/ajouterMonaieReserve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ajoutDto),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Erreur lors de l'ajout");
      }

      await fetchCaisse();
      handleCloseModalAjouter();
      showNotification("Monnaies ajoutées avec succès !", "success");
    } catch (err: any) {
      showNotification(err.message || "Erreur lors de l'ajout", "error");
    }
  };

  const retirerMonnaies = async (data: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/caisse/retierMonnaie`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Erreur lors du retrait");
      }

      await fetchCaisse();
      handleCloseModalRetirer();
      showNotification("Monnaies retirées avec succès !", "success");
    } catch (err: any) {
      showNotification(err.message || "Erreur lors du retrait", "error");
    }
  };

  const renderMonnaieCard = (
    item: MonaieItem,
    index: number,
    isReserve: boolean = false
  ) => {
    const seuil = SEUILS_ALERTE[item.monaie.toString()] || 0;
    const isLow = isReserve ? item.quantite < seuil : item.quantite < 3;

    return (
      <div
        key={index}
        className={`flex flex-col items-center p-3 rounded-xl border transition-all duration-200 ${
          isLow
            ? isReserve
              ? "border-orange-400 bg-orange-50 dark:bg-orange-900/30 dark:border-orange-400"
              : "border-red-400 bg-red-50 dark:bg-red-900/30 dark:border-red-400"
            : "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
        }`}
      >
        <span className="text-gray-700 dark:text-gray-200 font-medium text-lg">
          {item.monaie.toLocaleString()} Ar
        </span>
        <span
          className={`mt-1 font-bold text-lg ${
            isLow
              ? isReserve
                ? "text-orange-600 dark:text-orange-400"
                : "text-red-600 dark:text-red-400"
              : "text-green-700 dark:text-green-400"
          }`}
        >
          {item.quantite}
        </span>
        {isLow && (
          <span
            className={`mt-1 text-xs ${
              isReserve
                ? "text-orange-500 dark:text-orange-300"
                : "text-red-500 dark:text-red-300"
            }`}
          >
            ⚠️ faible
          </span>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!caisse || caisse.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400">
          <p className="font-semibold">❌ {caisse?.error || "Erreur de chargement"}</p>
          <button
            onClick={fetchCaisse}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      {/* Notification */}
      {notification.show && (
        <div
          className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 animate-in slide-in-from-right ${
            notification.type === "success"
              ? "bg-green-500 text-white"
              : notification.type === "error"
              ? "bg-red-500 text-white"
              : "bg-blue-500 text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            <span>
              {notification.type === "success"
                ? "✓"
                : notification.type === "error"
                ? "✗"
                : "ℹ"}
            </span>
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
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

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">💵 Liquide</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-400">
            {caisse.caisseLiquideTotal.toLocaleString()} Ar
          </p>
        </div>
        <div className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">🪙 Réserve</p>
          <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
            {caisse.monnaieRendueTotal.toLocaleString()} Ar
          </p>
        </div>
        <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">📱 Virtuel</p>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
            {caisse.caisseVirtuelle.toLocaleString()} Ar
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Argent liquide */}
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg transition-colors">
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
            💵 Argent Liquide
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
              ({caisse.caisseLiquide.length})
            </span>
          </h2>

          {caisse.caisseLiquide.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Aucun billet dans la caisse
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {caisse.caisseLiquide.map((item, index) =>
                renderMonnaieCard(item, index, false)
              )}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="font-bold text-green-700 dark:text-green-400 text-lg">
              Total : {caisse.caisseLiquideTotal.toLocaleString()} Ar
            </p>
          </div>
        </div>

        {/* Reserve de monnaie */}
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg transition-colors">
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
            🪙 Réserve de Monnaie
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
              ({caisse.monnaieRendue.length})
            </span>
          </h2>

          {caisse.monnaieRendue.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Aucune monnaie dans la réserve
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {caisse.monnaieRendue.map((item, index) =>
                renderMonnaieCard(item, index, true)
              )}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="font-bold text-yellow-700 dark:text-yellow-400 text-lg">
              Total : {caisse.monnaieRendueTotal.toLocaleString()} Ar
            </p>
          </div>
        </div>
      </div>

      {/* Section Actions et Total */}
      <div className="space-y-4">
        <button
          onClick={() => setShowModalRetirer(true)}
          className="w-full bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 font-semibold"
        >
          <span className="text-xl">➖</span>
          Retirer des monnaies
        </button>

        {/* Total Général */}
        <div className="p-6 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-2xl text-center shadow-lg transition-colors border-2 border-green-200 dark:border-green-700">
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
            💰 Total Général
          </h2>
          <p className="text-4xl font-bold text-green-800 dark:text-green-300">
            {caisse.total.toLocaleString()} Ar
          </p>
          <div className="mt-3 flex items-center justify-center gap-4 text-sm text-gray-700 dark:text-gray-300">
            <span>💵 {caisse.caisseLiquideTotal.toLocaleString()}</span>
            <span>•</span>
            <span>🪙 {caisse.monnaieRendueTotal.toLocaleString()}</span>
            <span>•</span>
            <span>📱 {caisse.caisseVirtuelle.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Modals avec key pour forcer le remontage */}
      <ModalAjouterMonnaies
        key={`ajouter-${modalKey}`}
        show={showModalAjouter}
        onClose={handleCloseModalAjouter}
        onAdd={ajouterMonnaiesReserve}
      />

      <ModalRetirerMonnaies
        key={`retirer-${modalKey}`}
        show={showModalRetirer}
        onClose={handleCloseModalRetirer}
        onRetirer={retirerMonnaies}
        caisse={caisse}
      />
    </div>
  );
}
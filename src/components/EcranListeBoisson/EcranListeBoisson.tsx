"use client";

import { TypeBoisson } from "@/types/Boisson";
import { useEffect, useState } from "react";
import { ChevronDown, Fullscreen, Search, Coins, CupSoda } from "lucide-react";

interface EcranListeBoissonProps {
    onExpandClick?: () => void;
}

export function EcranListeBoisson({ onExpandClick }: EcranListeBoissonProps) {
    const [boissons, setBoissons] = useState<TypeBoisson[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchMode, setSearchMode] = useState<"nom" | "prix">("nom");
    const [searchValue, setSearchValue] = useState<string>("");

    async function loadBoissons() {
        setLoading(true);
        try {
            const url = "http://localhost:8080/api/v1/beverages";
            const response = await fetch(url);
            const data: TypeBoisson[] = await response.json();
            setBoissons(data);
        } catch (error) {
            console.error("Erreur lors du chargement des boissons:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadBoissons();
    }, []);

    const filteredBoissons = boissons.filter((boisson) => {
        if (!searchValue) return true;
        if (searchMode === "nom") {
            return boisson.nomBoisson
                .toLowerCase()
                .includes(searchValue.toLowerCase());
        } else {
            const montant = parseFloat(searchValue);
            if (isNaN(montant)) return true;
            return boisson.prixBoisson <= montant;
        }
    });

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-blue-900">
                <div className="text-white text-2xl font-bold animate-pulse">
                    Chargement...
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex flex-col text-white">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-800 to-blue-600 p-4 text-center border-b border-blue-500 shadow-md">
                <h2 className="text-2xl font-bold drop-shadow-md">🥤 Nos Boissons</h2>
            </div>

            {/* Liste des boissons */}
            <div className="flex-1 p-4 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                    {filteredBoissons.map((boisson) => {
                        const isAvailable = boisson.quantiteDispo > 0;
                        return (
                            <div
                                key={boisson.idBoisson}
                                className={`rounded-xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer ${
                                    !isAvailable ? "opacity-60" : ""
                                }`}
                            >
                                {/* Image */}
                                <div className="bg-gradient-to-br from-blue-500 to-blue-700 h-32 flex items-center justify-center">
                                    <span className="text-6xl">🥤</span>
                                </div>

                                {/* Contenu */}
                                <div className="p-3 text-center">
                                    <h3 className="text-lg font-bold truncate">
                                        {boisson.nomBoisson}
                                    </h3>

                                    <div className="text-2xl font-bold text-blue-400 my-1">
                                        {boisson.prixBoisson.toLocaleString()} Ar
                                    </div>

                                    <div
                                        className={`text-xs font-semibold px-2 py-1 rounded-full inline-block ${
                                            boisson.quantiteDispo > 5
                                                ? "bg-green-800/40 text-green-300"
                                                : boisson.quantiteDispo > 0
                                                ? "bg-yellow-800/40 text-yellow-300"
                                                : "bg-red-800/40 text-red-300"
                                        }`}
                                    >
                                        {isAvailable
                                            ? `${boisson.quantiteDispo} en stock`
                                            : "Rupture"}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Barre de recherche */}
            <div className="p-3 bg-slate-900/70 border-t border-slate-700 flex flex-col gap-3">
                {/* <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => setSearchMode("nom")}
                        className={`p-2 rounded-lg ${
                            searchMode === "nom"
                                ? "bg-blue-600 text-white"
                                : "bg-slate-700 text-slate-300"
                        } hover:bg-blue-500 transition`}
                        title="Rechercher par nom"
                    >
                        <CupSoda className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => setSearchMode("prix")}
                        className={`p-2 rounded-lg ${
                            searchMode === "prix"
                                ? "bg-blue-600 text-white"
                                : "bg-slate-700 text-slate-300"
                        } hover:bg-blue-500 transition`}
                        title="Rechercher par montant"
                    >
                        <Coins className="w-5 h-5" />
                    </button>

                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
                        <input
                            type={searchMode === "prix" ? "number" : "text"}
                            placeholder={
                                searchMode === "nom"
                                    ? "Rechercher une boisson..."
                                    : "Entrer un montant..."
                            }
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            className="w-full bg-slate-800 text-white pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none placeholder-slate-400"
                        />
                    </div>
                </div> */}

                {/* Bouton plein écran */}
                <button
                    onClick={onExpandClick}
                    className="cursor-pointer w-full bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-800 hover:to-blue-600 text-white font-bold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                    <Fullscreen className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
}

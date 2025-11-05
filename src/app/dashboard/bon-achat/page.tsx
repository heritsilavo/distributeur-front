"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, X, Download } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface BonAchat {
    id: number;
    valeur: number;
    utilise: boolean;
    description?: string;
}

export default function BonsAchatPage() {
    const [bons, setBons] = useState<BonAchat[]>([]);
    const [selected, setSelected] = useState<BonAchat | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        valeur: 0,
        description: ""
    });

    // --- Charger les bons ---
    const loadBons = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:8080/api/v1/bon-achat");
            if (!response.ok) throw new Error("Erreur lors du chargement");
            const data = await response.json();
            setBons(data);
        } catch (error) {
            console.error("Erreur:", error);
            alert("Erreur lors du chargement des bons");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBons();
    }, []);

    // --- Créer un nouveau bon ---
    const createBon = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:8080/api/v1/bon-achat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    valeur: form.valeur,
                    description: form.description || null
                })
            });

            if (!response.ok) throw new Error("Erreur lors de la création");

            await loadBons();
            setShowForm(false);
            resetForm();
        } catch (error) {
            console.error("Erreur:", error);
            alert("Erreur lors de la création du bon");
        } finally {
            setLoading(false);
        }
    };

    // --- Modifier un bon existant ---
    const updateBon = async () => {
        if (!selected) return;

        try {
            setLoading(true);
            const response = await fetch(`http://localhost:8080/api/v1/bon-achat/${selected.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: selected.id,
                    valeur: form.valeur,
                    description: form.description || null,
                    utilise: selected.utilise
                })
            });

            if (!response.ok) throw new Error("Erreur lors de la modification");

            await loadBons();
            setShowForm(false);
            resetForm();
        } catch (error) {
            console.error("Erreur:", error);
            alert("Erreur lors de la modification du bon");
        } finally {
            setLoading(false);
        }
    };

    // --- Supprimer un bon ---
    const deleteBon = async (id: number) => {
        if (!confirm("Confirmer la suppression ?")) return;

        try {
            setLoading(true);
            const response = await fetch(`http://localhost:8080/api/v1/bon-achat/${id}`, {
                method: "DELETE"
            });

            if (!response.ok) throw new Error("Erreur lors de la suppression");

            await loadBons();
        } catch (error) {
            console.error("Erreur:", error);
            alert("Erreur lors de la suppression du bon");
        } finally {
            setLoading(false);
        }
    };

    // --- Utiliser un bon ---
    const utiliserBon = async (id: number) => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:8080/api/v1/bon-achat/utiliser/${id}`, {
                method: "PUT"
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || "Erreur lors de l'utilisation du bon");
            }

            await loadBons();
            alert("Bon utilisé avec succès !");
        } catch (error) {
            console.error("Erreur:", error);
            alert(error instanceof Error ? error.message : "Erreur lors de l'utilisation du bon");
        } finally {
            setLoading(false);
        }
    };

    // --- Réinitialiser le formulaire ---
    const resetForm = () => {
        setForm({ valeur: 0, description: "" });
        setSelected(null);
    };

    // --- Ouvrir le formulaire de création ---
    const openCreateForm = () => {
        resetForm();
        setShowForm(true);
    };

    // --- Ouvrir le formulaire de modification ---
    const openUpdateForm = (bon: BonAchat) => {
        setSelected(bon);
        setForm({
            valeur: bon.valeur,
            description: bon.description || ""
        });
        setShowForm(true);
    };

    // --- Télécharger le QR Code ---
    const downloadQRCode = (bon: BonAchat) => {
        const svg = document.getElementById(`qrcode-${bon.id}`);
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        link.href = url;
        link.download = `bon-achat-${bon.id}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // --- Soumettre le formulaire ---
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selected) {
            updateBon();
        } else {
            createBon();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 transition-colors">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
                            Gestion des Bons d'Achat
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Ajoutez, consultez et générez le QR code des bons
                        </p>
                    </div>
                    <button
                        onClick={openCreateForm}
                        disabled={loading}
                        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors shadow-sm"
                    >
                        <Plus size={18} /> Ajouter un bon
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-200">ID</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-200">Valeur</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-200">Statut</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-200">Description</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-200">QR Code</th>
                                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-700 dark:text-gray-200">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {loading && bons.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                            Chargement...
                                        </td>
                                    </tr>
                                ) : bons.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                            Aucun bon enregistré
                                        </td>
                                    </tr>
                                ) : (
                                    bons.map(bon => (
                                        <tr key={bon.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                            <td className="px-6 py-4 font-medium">{bon.id}</td>
                                            <td className="px-6 py-4">{bon.valeur.toLocaleString()} Ar</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    bon.utilise 
                                                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" 
                                                        : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                }`}>
                                                    {bon.utilise ? "Utilisé" : "Disponible"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">{bon.description || "-"}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col items-center space-y-2">
                                                    <QRCodeSVG 
                                                        id={`qrcode-${bon.id}`}
                                                        value={bon.id.toString()} 
                                                        size={64}
                                                        includeMargin
                                                    />
                                                    <button
                                                        onClick={() => downloadQRCode(bon)}
                                                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                                    >
                                                        <Download size={12} />
                                                        Télécharger
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => deleteBon(bon.id)}
                                                        disabled={loading}
                                                        className="px-3 py-1.5 text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900 hover:bg-red-100 dark:hover:bg-red-800 rounded-md disabled:opacity-50 transition-colors"
                                                    >
                                                        Supprimer
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal Form */}
                {showForm && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
                            <form onSubmit={handleSubmit}>
                                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                        {selected ? "Modifier le bon" : "Nouveau bon d'achat"}
                                    </h2>
                                    <button 
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="px-6 py-5 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
                                            Valeur (Ar) *
                                        </label>
                                        <input
                                            type="number"
                                            min={0}
                                            step="0.01"
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                            value={form.valeur}
                                            onChange={(e) => setForm({ ...form, valeur: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
                                            Description
                                        </label>
                                        <textarea
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                            value={form.description}
                                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                                            placeholder="Description optionnelle du bon..."
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-900 rounded-b-xl">
                                    <button 
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={loading}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                                    >
                                        {loading ? "Traitement..." : (selected ? "Enregistrer" : "Créer")}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
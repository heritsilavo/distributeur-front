// ============================================
// COMPOSANT: Modal Retirer Monnaies

import { useState } from "react";

// ============================================
interface ModalRetirerMonnaiesProps {
    show: boolean;
    onClose: () => void;
    onRetirer: (data: any) => void;
    caisse: any;
}

export function ModalRetirerMonnaies({ show, onClose, onRetirer, caisse }: ModalRetirerMonnaiesProps) {
    const [typeRetrait, setTypeRetrait] = useState<"caisseLiquide" | "reserveMonaie" | "caisseVirtuelle">("caisseLiquide");
    const [montantVirtuel, setMontantVirtuel] = useState("");
    const [billetsRetirer, setBilletsRetirer] = useState<Record<string, string>>({});

    const handleClose = () => {
        setTypeRetrait("caisseLiquide");
        setMontantVirtuel("");
        setBilletsRetirer({});
        onClose();
    };

    const handleRetirer = () => {
        if (typeRetrait === "caisseVirtuelle") {
            if (!montantVirtuel || Number(montantVirtuel) <= 0) {
                return;
            }
            onRetirer({
                type: typeRetrait,
                montant: Number(montantVirtuel)
            });
        } else {
            const billets = Object.entries(billetsRetirer)
                .filter(([_, qty]) => qty && Number(qty) > 0)
                .map(([valeur, quantite]) => ({
                    valeur: Number(valeur),
                    quantite: Number(quantite)
                }));

            if (billets.length === 0) {
                return;
            }

            onRetirer({
                type: typeRetrait,
                billets
            });
        }
    };

    const handleBilletChange = (valeur: string, quantite: string) => {
        setBilletsRetirer({ ...billetsRetirer, [valeur]: quantite });
    };

    const getBilletsDisponibles = () => {
        if (typeRetrait === "caisseLiquide") {
            return caisse?.caisseLiquide || [];
        } else if (typeRetrait === "reserveMonaie") {
            return caisse?.monnaieRendue || [];
        }
        return [];
    };

    const calculateTotal = () => {
        return Object.entries(billetsRetirer)
            .filter(([_, qty]) => qty && Number(qty) > 0)
            .reduce((acc, [valeur, quantite]) => acc + Number(valeur) * Number(quantite), 0);
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-gradient-to-r from-red-500 to-rose-500 dark:from-red-600 dark:to-rose-600 p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                ➖ Retirer des Monnaies
                            </h2>
                            <p className="text-red-100 text-sm mt-1">
                                Choisissez la source et les montants à retirer
                            </p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    {/* Select Type de Retrait */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Source du retrait
                        </label>
                        <select
                            value={typeRetrait}
                            onChange={(e) => {
                                setTypeRetrait(e.target.value as any);
                                setBilletsRetirer({});
                                setMontantVirtuel("");
                            }}
                            className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                            <option value="caisseLiquide">💵 Caisse Liquide</option>
                            <option value="reserveMonaie">🪙 Réserve de Monnaie</option>
                            <option value="caisseVirtuelle">💳 Caisse Virtuelle</option>
                        </select>
                    </div>

                    {/* Si Caisse Virtuelle */}
                    {typeRetrait === "caisseVirtuelle" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Montant à retirer (Ar)
                            </label>
                            <input
                                type="number"
                                min="0"
                                placeholder="Ex: 50000"
                                value={montantVirtuel}
                                onChange={(e) => setMontantVirtuel(e.target.value)}
                                className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                        </div>
                    )}

                    {/* Si Caisse Liquide ou Réserve Monnaie */}
                    {(typeRetrait === "caisseLiquide" || typeRetrait === "reserveMonaie") && (
                        <div className="space-y-3">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                Billets à retirer
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {getBilletsDisponibles().map((item: { monaie: number; quantite: number }) => (
                                    <div key={item.monaie} className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-3">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                                                {item.monaie.toLocaleString()} Ar
                                            </span>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                Dispo: {item.quantite}
                                            </span>
                                        </div>
                                        <input
                                            type="number"
                                            min="0"
                                            max={item.quantite}
                                            placeholder="Quantité"
                                            value={billetsRetirer[item.monaie.toString()] || ""}
                                            onChange={(e) => handleBilletChange(item.monaie.toString(), e.target.value)}
                                            className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Aperçu */}
                    {typeRetrait !== "caisseVirtuelle" && (
                        <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                📊 Aperçu du retrait
                            </h3>
                            <div className="space-y-1 text-sm">
                                {Object.entries(billetsRetirer)
                                    .filter(([_, qty]) => qty && Number(qty) > 0)
                                    .map(([valeur, quantite]) => (
                                        <div key={valeur} className="flex justify-between text-gray-700 dark:text-gray-300">
                                            <span>{Number(valeur).toLocaleString()} Ar × {quantite}</span>
                                            <span className="font-semibold">
                                                = {(Number(valeur) * Number(quantite)).toLocaleString()} Ar
                                            </span>
                                        </div>
                                    ))}
                                <div className="pt-2 mt-2 border-t border-red-300 dark:border-red-700 flex justify-between font-bold text-gray-900 dark:text-gray-100">
                                    <span>Total à retirer:</span>
                                    <span className="text-red-600 dark:text-red-400">
                                        {calculateTotal().toLocaleString()} Ar
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="sticky bottom-0 bg-gray-100 dark:bg-gray-900 p-6 rounded-b-2xl flex gap-3">
                    <button
                        onClick={handleClose}
                        className="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleRetirer}
                        className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        <span>✅</span>
                        Retirer
                    </button>
                </div>
            </div>
        </div>
    );
}

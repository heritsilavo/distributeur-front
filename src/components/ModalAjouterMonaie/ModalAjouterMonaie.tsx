import { useState } from "react";

interface ModalAjouterMonnaiesProps {
    show: boolean;
    onClose: () => void;
    onAdd: (monnaiesValides: Array<{ valeur: string; quantite: string }>) => void;
}

export function ModalAjouterMonnaies({ show, onClose, onAdd }: ModalAjouterMonnaiesProps) {
    const [monnaies, setMonnaies] = useState<Array<{ valeur: string; quantite: string }>>([
        { valeur: "", quantite: "" },
    ]);

    const ajouterLigneMonnaie = () => {
        setMonnaies([...monnaies, { valeur: "", quantite: "" }]);
    };

    const supprimerLigneMonnaie = (index: number) => {
        if (monnaies.length > 1) {
            setMonnaies(monnaies.filter((_, i) => i !== index));
        }
    };

    const handleMonnaieChange = (index: number, field: "valeur" | "quantite", value: string) => {
        const newMonnaies = [...monnaies];
        newMonnaies[index][field] = value;
        setMonnaies(newMonnaies);
    };

    const handleAdd = () => {
        const monnaiesValides = monnaies.filter(
            (m) => m.valeur && m.quantite && Number(m.valeur) > 0 && Number(m.quantite) > 0
        );
        onAdd(monnaiesValides);
    };

    const handleClose = () => {
        setMonnaies([{ valeur: "", quantite: "" }]);
        onClose();
    };

    const totalAjouter = monnaies
        .filter((m) => m.valeur && m.quantite)
        .reduce((acc, m) => acc + Number(m.valeur) * Number(m.quantite), 0);

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header Modal */}
                <div className="sticky top-0 bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600 p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                ➕ Ajouter des Monnaies dans la Réserve
                            </h2>
                            <p className="text-green-100 text-sm mt-1">
                                Saisissez les valeurs et quantités à ajouter
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

                {/* Body Modal */}
                <div className="p-6 space-y-4">
                    {monnaies.map((monnaie, index) => (
                        <div key={index} className="flex gap-3 items-start">
                            <div className="flex-1 grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Valeur (Ar)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="Ex: 500"
                                        value={monnaie.valeur}
                                        onChange={(e) => handleMonnaieChange(index, "valeur", e.target.value)}
                                        className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Quantité
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="Ex: 10"
                                        value={monnaie.quantite}
                                        onChange={(e) => handleMonnaieChange(index, "quantite", e.target.value)}
                                        className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={() => supprimerLigneMonnaie(index)}
                                disabled={monnaies.length === 1}
                                className="mt-7 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-colors"
                                title="Supprimer"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    ))}

                    <button
                        onClick={ajouterLigneMonnaie}
                        className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-500 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 py-3 rounded-lg transition-all flex items-center justify-center gap-2 font-medium"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Ajouter une ligne
                    </button>

                    {/* Aperçu */}
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            📊 Aperçu
                        </h3>
                        <div className="space-y-1 text-sm">
                            {monnaies
                                .filter((m) => m.valeur && m.quantite)
                                .map((m, i) => (
                                    <div key={i} className="flex justify-between text-gray-700 dark:text-gray-300">
                                        <span>{Number(m.valeur).toLocaleString()} Ar × {m.quantite}</span>
                                        <span className="font-semibold">
                                            = {(Number(m.valeur) * Number(m.quantite)).toLocaleString()} Ar
                                        </span>
                                    </div>
                                ))}
                            <div className="pt-2 mt-2 border-t border-gray-300 dark:border-gray-600 flex justify-between font-bold text-gray-900 dark:text-gray-100">
                                <span>Total à ajouter:</span>
                                <span className="text-green-600 dark:text-green-400">
                                    {totalAjouter.toLocaleString()} Ar
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Modal */}
                <div className="sticky bottom-0 bg-gray-100 dark:bg-gray-900 p-6 rounded-b-2xl flex gap-3">
                    <button
                        onClick={handleClose}
                        className="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleAdd}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        <span>✅</span>
                        Ajouter à la réserve
                    </button>
                </div>
            </div>
        </div>
    );
}
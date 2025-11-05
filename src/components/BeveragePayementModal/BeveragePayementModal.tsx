import React, { useState, useEffect } from 'react';
import { X, Search, Wallet, QrCode, ShoppingCart, Plus, Minus } from 'lucide-react';

interface TypeBoisson {
    idBoisson: number;
    nomBoisson: string;
    prixBoisson: number;
    quantiteDispo: number;
}

interface CartItem extends TypeBoisson {
    quantiteAchat: number;
}

interface Monnaie {
    valeur: string;
    quantite: string;
}

export function PaymentModal({ handleClose, onPayementEffectue }: { handleClose: () => void, onPayementEffectue: (mode:"CASH" | "QR", result: any) => void }) {
    const [step, setStep] = useState<1 | 2>(1);
    const [boissons, setBoissons] = useState<TypeBoisson[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [budgetMax, setBudgetMax] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<'liquide' | 'qr' | null>(null);
    const [monnaies, setMonnaies] = useState<Monnaie[]>([{ valeur: '', quantite: '' }]);
    const [qrFile, setQrFile] = useState<File | null>(null);
    const [qrPreview, setQrPreview] = useState<string | null>(null);

    useEffect(() => {
        fetchBoissons();
    }, []);

    const fetchBoissons = async () => {
        try {
            const url = "http://localhost:8080/api/v1/beverages";
            const response = await fetch(url);
            const data: TypeBoisson[] = await response.json();
            setBoissons(data);
        } catch (error) {
            console.error('Erreur lors du chargement des boissons:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredBoissons = boissons.filter(boisson => {
        const matchesSearch = boisson.nomBoisson.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesBudget = budgetMax === '' || boisson.prixBoisson <= parseFloat(budgetMax);
        return matchesSearch && matchesBudget;
    });

    const addToCart = (boisson: TypeBoisson) => {
        const existingItem = cart.find(item => item.idBoisson === boisson.idBoisson);
        if (existingItem) {
            updateQuantity(boisson.idBoisson, existingItem.quantiteAchat + 1);
        } else {
            setCart([...cart, { ...boisson, quantiteAchat: 1 }]);
        }
    };

    const updateQuantity = (idBoisson: number, newQuantity: number) => {
        const item = boissons.find(b => b.idBoisson === idBoisson);
        if (item && newQuantity > item.quantiteDispo) return;

        if (newQuantity <= 0) {
            setCart(cart.filter(item => item.idBoisson !== idBoisson));
        } else {
            setCart(cart.map(item =>
                item.idBoisson === idBoisson
                    ? { ...item, quantiteAchat: newQuantity }
                    : item
            ));
        }
    };

    const getTotalPrice = () => {
        return cart.reduce((total, item) => total + (item.prixBoisson * item.quantiteAchat), 0);
    };

    const getTotalMonnaieSaisie = () => {
        return monnaies.reduce((total, m) => {
            const valeur = parseFloat(m.valeur) || 0;
            const quantite = parseFloat(m.quantite) || 0;
            return total + (valeur * quantite);
        }, 0);
    };

    const handleMonnaieChange = (index: number, field: 'valeur' | 'quantite', value: string) => {
        const newMonnaies = [...monnaies];
        newMonnaies[index][field] = value;
        setMonnaies(newMonnaies);
    };

    const ajouterLigneMonnaie = () => {
        setMonnaies([...monnaies, { valeur: '', quantite: '' }]);
    };

    const supprimerLigneMonnaie = (index: number) => {
        if (monnaies.length > 1) {
            setMonnaies(monnaies.filter((_, i) => i !== index));
        }
    };

    const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setQrFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setQrPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePayment = async () => {
        if (paymentMethod === 'liquide') {
            const totalSaisie = getTotalMonnaieSaisie();
            const totalAPayer = getTotalPrice();
            if (totalSaisie >= totalAPayer) {

                const payementDTO = {
                    items: cart.map(item => ({
                        boissonId: item.idBoisson,
                        quantite: item.quantiteAchat
                    })),
                    mode: "CASH",
                    compteQR: null,
                    bills: monnaies.map(m => ({
                        monaie: m.valeur,
                        quantite: m.quantite
                    }))
                }

                const url = "http://localhost:8080/api/v1/purchase";
                var result = await fetch(
                    url,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payementDTO),
                    }
                )
                const data = await result.json()
                onPayementEffectue("CASH", data);
                
            } else {
                alert(`Montant insuffisant. Il manque ${(totalAPayer - totalSaisie).toFixed(2)} Ar`);
            }
        } else if (paymentMethod === 'qr' && qrFile) {
            alert('Paiement par QR code en cours de traitement...');
            // Logique de paiement QR ici
        }
    };

    const canProceedToPayment = cart.length > 0;
    const canCompletePayment = paymentMethod === 'liquide'
        ? getTotalMonnaieSaisie() >= getTotalPrice()
        : paymentMethod === 'qr' && qrFile !== null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="relative w-[95%] md:w-[85%] lg:w-[75%] max-h-[90vh] bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-slate-800/50 border-b border-slate-700 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <ShoppingCart className="w-8 h-8 text-green-400" />
                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                {step === 1 ? 'Sélection des boissons' : 'Paiement'}
                            </h2>
                            <p className="text-sm text-slate-400 mt-1">
                                Étape {step} sur 2
                            </p>
                        </div>
                    </div>
                    <button onClick={handleClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {step === 1 ? (
                        <div className="space-y-6">
                            {/* Filtres */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Rechercher une boisson..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="number"
                                        placeholder="Budget maximum (Ar)"
                                        value={budgetMax}
                                        onChange={(e) => setBudgetMax(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Liste des boissons */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {loading ? (
                                    <p className="text-slate-400 col-span-2 text-center py-8">Chargement...</p>
                                ) : filteredBoissons.length === 0 ? (
                                    <p className="text-slate-400 col-span-2 text-center py-8">Aucune boisson trouvée</p>
                                ) : (
                                    filteredBoissons.map(boisson => {
                                        const cartItem = cart.find(item => item.idBoisson === boisson.idBoisson);
                                        return (
                                            <div key={boisson.idBoisson} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-green-500 transition-all">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-semibold text-white">{boisson.nomBoisson}</h3>
                                                        <p className="text-green-400 font-bold text-xl mt-1">{boisson.prixBoisson} Ar</p>
                                                        <p className="text-sm text-slate-400 mt-1">
                                                            Stock: {boisson.quantiteDispo} unités
                                                        </p>
                                                    </div>
                                                </div>

                                                {cartItem ? (
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => updateQuantity(boisson.idBoisson, cartItem.quantiteAchat - 1)}
                                                            className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                                                        >
                                                            <Minus className="w-4 h-4 text-white" />
                                                        </button>
                                                        <span className="text-white font-semibold text-lg px-4">
                                                            {cartItem.quantiteAchat}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(boisson.idBoisson, cartItem.quantiteAchat + 1)}
                                                            disabled={cartItem.quantiteAchat >= boisson.quantiteDispo}
                                                            className="p-2 bg-green-500 hover:bg-green-600 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg transition-colors"
                                                        >
                                                            <Plus className="w-4 h-4 text-white" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => addToCart(boisson)}
                                                        disabled={boisson.quantiteDispo === 0}
                                                        className="w-full py-2 bg-green-500 hover:bg-green-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                                                    >
                                                        {boisson.quantiteDispo === 0 ? 'Rupture de stock' : 'Ajouter'}
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Panier récapitulatif */}
                            {cart.length > 0 && (
                                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-green-400 mb-3">Panier</h3>
                                    <div className="space-y-2">
                                        {cart.map(item => (
                                            <div key={item.idBoisson} className="flex justify-between text-white">
                                                <span>{item.nomBoisson} x{item.quantiteAchat}</span>
                                                <span className="font-semibold">{item.prixBoisson * item.quantiteAchat} Ar</span>
                                            </div>
                                        ))}
                                        <div className="pt-3 border-t border-green-500/30 flex justify-between text-green-400 font-bold text-xl">
                                            <span>Total:</span>
                                            <span>{getTotalPrice()} Ar</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Récapitulatif */}
                            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-white mb-3">Récapitulatif de la commande</h3>
                                <div className="space-y-2">
                                    {cart.map(item => (
                                        <div key={item.idBoisson} className="flex justify-between text-slate-300">
                                            <span>{item.nomBoisson} x{item.quantiteAchat}</span>
                                            <span>{item.prixBoisson * item.quantiteAchat} Ar</span>
                                        </div>
                                    ))}
                                    <div className="pt-3 border-t border-slate-600 flex justify-between text-green-400 font-bold text-xl">
                                        <span>Total à payer:</span>
                                        <span>{getTotalPrice()} Ar</span>
                                    </div>
                                </div>
                            </div>

                            {/* Choix méthode de paiement */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">Méthode de paiement</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <button
                                        onClick={() => setPaymentMethod('liquide')}
                                        className={`p-6 rounded-lg border-2 transition-all ${paymentMethod === 'liquide'
                                            ? 'border-green-500 bg-green-500/10'
                                            : 'border-slate-600 hover:border-slate-500'
                                            }`}
                                    >
                                        <Wallet className="w-12 h-12 text-green-400 mx-auto mb-3" />
                                        <p className="text-white font-semibold text-center">Paiement Liquide</p>
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod('qr')}
                                        className={`p-6 rounded-lg border-2 transition-all ${paymentMethod === 'qr'
                                            ? 'border-green-500 bg-green-500/10'
                                            : 'border-slate-600 hover:border-slate-500'
                                            }`}
                                    >
                                        <QrCode className="w-12 h-12 text-green-400 mx-auto mb-3" />
                                        <p className="text-white font-semibold text-center">Bon d'achat QR</p>
                                    </button>
                                </div>

                                {/* Interface paiement liquide */}
                                {paymentMethod === 'liquide' && (
                                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                                        <h4 className="text-white font-semibold mb-4">Saisir les billets et pièces</h4>
                                        <div className="space-y-4">
                                            {monnaies.map((monnaie, index) => (
                                                <div key={index} className="flex gap-3 items-start">
                                                    <div className="flex-1 grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                                                Valeur (Ar)
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                placeholder="Ex: 500"
                                                                value={monnaie.valeur}
                                                                onChange={(e) => handleMonnaieChange(index, "valeur", e.target.value)}
                                                                className="w-full border-2 border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-slate-700 text-white"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                                                Quantité
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                placeholder="Ex: 10"
                                                                value={monnaie.quantite}
                                                                onChange={(e) => handleMonnaieChange(index, "quantite", e.target.value)}
                                                                className="w-full border-2 border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-slate-700 text-white"
                                                            />
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => supprimerLigneMonnaie(index)}
                                                        disabled={monnaies.length === 1}
                                                        className="mt-7 bg-red-500 hover:bg-red-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-colors"
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
                                                className="w-full border-2 border-dashed border-slate-600 hover:border-green-500 text-slate-400 hover:text-green-400 py-3 rounded-lg transition-all flex items-center justify-center gap-2 font-medium"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                Ajouter une ligne
                                            </button>

                                            {/* Total saisi */}
                                            <div className="mt-4 pt-4 border-t border-slate-600">
                                                <div className="flex justify-between text-white font-semibold text-lg mb-2">
                                                    <span>Total saisi:</span>
                                                    <span className="text-green-400">{getTotalMonnaieSaisie()} Ar</span>
                                                </div>
                                                <div className="flex justify-between text-white font-semibold text-lg">
                                                    <span>À rendre:</span>
                                                    <span className={getTotalMonnaieSaisie() >= getTotalPrice() ? 'text-green-400' : 'text-red-400'}>
                                                        {Math.max(0, getTotalMonnaieSaisie() - getTotalPrice())} Ar
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Interface QR */}
                                {paymentMethod === 'qr' && (
                                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                                        <h4 className="text-white font-semibold mb-4">Uploader le code QR</h4>
                                        <div className="border-2 border-dashed border-slate-600 hover:border-green-500 rounded-lg p-8 text-center transition-all">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleQrUpload}
                                                className="hidden"
                                                id="qr-upload"
                                            />
                                            <label htmlFor="qr-upload" className="cursor-pointer">
                                                {qrPreview ? (
                                                    <div>
                                                        <img src={qrPreview} alt="QR Preview" className="max-w-xs mx-auto rounded-lg mb-4" />
                                                        <p className="text-green-400 font-semibold">QR code chargé avec succès</p>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <QrCode className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                                                        <p className="text-slate-400">Cliquez pour uploader le code QR</p>
                                                    </div>
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer avec boutons */}
                <div className="bg-slate-800/50 border-t border-slate-700 p-6 flex justify-between items-center">
                    {step === 1 ? (
                        <>
                            <div className="text-slate-400">
                                {cart.length} article(s) - {getTotalPrice()} Ar
                            </div>
                            <button
                                onClick={() => setStep(2)}
                                disabled={!canProceedToPayment}
                                className="px-8 py-3 bg-green-500 hover:bg-green-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                            >
                                Payer
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setStep(1)}
                                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
                            >
                                Retour
                            </button>
                            <button
                                onClick={handlePayment}
                                disabled={!canCompletePayment}
                                className="px-8 py-3 bg-green-500 hover:bg-green-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                            >
                                Confirmer le paiement
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
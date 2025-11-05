import React, { useState, useEffect } from 'react';
import { X, Search, Wallet, QrCode, ShoppingCart, Plus, Minus, Loader2 } from 'lucide-react';
import jsQR from 'jsqr';

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

interface ErrorState {
    message: string;
    type: 'error' | 'warning' | 'info';
}

export function PaymentModal({ handleClose, onPayementEffectue }: { handleClose: () => void, onPayementEffectue: (mode:"CASH" | "QR", result: any) => void }) {
    const [step, setStep] = useState<1 | 2>(1);
    const [boissons, setBoissons] = useState<TypeBoisson[]>([]);
    const [loading, setLoading] = useState(true);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [qrLoading, setQrLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [budgetMax, setBudgetMax] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<'liquide' | 'qr' | null>(null);
    const [monnaies, setMonnaies] = useState<Monnaie[]>([{ valeur: '', quantite: '' }]);
    const [qrFile, setQrFile] = useState<File | null>(null);
    const [qrPreview, setQrPreview] = useState<string | null>(null);
    const [error, setError] = useState<ErrorState | null>(null);

    useEffect(() => {
        fetchBoissons();
    }, []);

    const showError = (message: string, type: 'error' | 'warning' | 'info' = 'error') => {
        setError({ message, type });
        // Auto-hide after 5 seconds
        setTimeout(() => setError(null), 5000);
    };

    const fetchBoissons = async () => {
        try {
            setLoading(true);
            setError(null);
            const url = "http://localhost:8080/api/v1/beverages";
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }
            
            const data: TypeBoisson[] = await response.json();
            setBoissons(data);
        } catch (error) {
            console.error('Erreur lors du chargement des boissons:', error);
            showError('Erreur lors du chargement des boissons. Veuillez réessayer.');
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
        if (item && newQuantity > item.quantiteDispo) {
            showError(`Quantité indisponible. Stock restant: ${item.quantiteDispo}`, 'warning');
            return;
        }

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

    const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                setQrLoading(true);
                setError(null);
                
                // Vérifier le type de fichier
                if (!file.type.startsWith('image/')) {
                    throw new Error('Veuillez sélectionner une image valide');
                }

                // Vérifier la taille du fichier (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    throw new Error('L\'image est trop volumineuse. Taille maximale: 5MB');
                }

                setQrFile(file);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setQrPreview(reader.result as string);
                    setQrLoading(false);
                };
                reader.onerror = () => {
                    throw new Error('Erreur lors de la lecture du fichier');
                };
                reader.readAsDataURL(file);
            } catch (error) {
                setQrLoading(false);
                showError(error instanceof Error ? error.message : 'Erreur lors du chargement du QR code');
                // Reset file input
                e.target.value = '';
            }
        }
    };

    const handlePayment = async () => {
        if (paymentMethod === 'liquide') {
            const totalSaisie = getTotalMonnaieSaisie();
            const totalAPayer = getTotalPrice();
            
            if (totalSaisie < totalAPayer) {
                showError(`Montant insuffisant. Il manque ${(totalAPayer - totalSaisie).toFixed(2)} Ar`, 'warning');
                return;
            }

            // Valider les saisies de monnaie
            for (const monnaie of monnaies) {
                if (!monnaie.valeur || !monnaie.quantite) {
                    showError('Veuillez remplir tous les champs de monnaie', 'warning');
                    return;
                }
                if (parseFloat(monnaie.valeur) <= 0 || parseFloat(monnaie.quantite) <= 0) {
                    showError('Les valeurs de monnaie doivent être positives', 'warning');
                    return;
                }
            }

            await processCashPayment();
        } else if (paymentMethod === 'qr') {
            if (!qrFile) {
                showError('Veuillez uploader un code QR', 'warning');
                return;
            }
            await processQrPayment();
        }
    };

    const processCashPayment = async () => {
        try {
            setPaymentLoading(true);
            setError(null);

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
            };

            const url = "http://localhost:8080/api/v1/purchase";
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payementDTO),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erreur ${response.status}: ${errorText || 'Erreur lors du paiement'}`);
            }

            const data = await response.json();
            onPayementEffectue("CASH", data);
            
        } catch (error) {
            console.error('Erreur lors du paiement:', error);
            showError(error instanceof Error ? error.message : 'Erreur lors du traitement du paiement');
        } finally {
            setPaymentLoading(false);
        }
    };

    const processQrPayment = async () => {
        try {
            setPaymentLoading(true);
            setError(null);

            const qrText = await decodeQRCode(qrFile!);
            
            const payementDTO = {
                items: cart.map(item => ({
                    boissonId: item.idBoisson,
                    quantite: item.quantiteAchat
                })),
                mode: "QR",
                compteQR: qrText,
                bills: []
            };

            const url = "http://localhost:8080/api/v1/purchase";
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payementDTO),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erreur ${response.status}: ${errorText || 'Erreur lors du paiement QR'}`);
            }

            const data = await response.json();
            onPayementEffectue("QR", data);
            
        } catch (error) {
            console.error('Erreur lors du paiement QR:', error);
            showError(error instanceof Error ? error.message : 'Erreur lors du traitement du paiement QR');
            setPaymentLoading(false);
        }
    };

    const decodeQRCode = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            img.onload = () => {
                try {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx!.drawImage(img, 0, 0);

                    const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
                    const code = jsQR(imageData.data, imageData.width, imageData.height);

                    if (code) {
                        resolve(code.data);
                    } else {
                        reject(new Error('Aucun QR code trouvé dans l\'image. Veuillez vérifier la qualité de l\'image.'));
                    }
                } catch (error) {
                    reject(new Error('Erreur lors du décodage du QR code'));
                }
            };

            img.onerror = () => reject(new Error('Erreur de chargement de l\'image'));
            img.src = URL.createObjectURL(file);
        });
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
                    <button 
                        onClick={handleClose} 
                        disabled={paymentLoading}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                {/* Message d'erreur */}
                {error && (
                    <div className={`mx-6 mt-4 p-4 rounded-lg border ${
                        error.type === 'error' 
                            ? 'bg-red-900/20 border-red-500 text-red-200' 
                            : error.type === 'warning'
                            ? 'bg-yellow-900/20 border-yellow-500 text-yellow-200'
                            : 'bg-blue-900/20 border-blue-500 text-blue-200'
                    }`}>
                        <div className="flex items-center justify-between">
                            <span>{error.message}</span>
                            <button 
                                onClick={() => setError(null)}
                                className="text-current hover:opacity-70"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

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
                                    <div className="col-span-2 flex flex-col items-center justify-center py-12">
                                        <Loader2 className="w-12 h-12 text-green-400 animate-spin mb-4" />
                                        <p className="text-slate-400 text-lg">Chargement des boissons...</p>
                                    </div>
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
                                        disabled={paymentLoading}
                                        className={`p-6 rounded-lg border-2 transition-all ${paymentMethod === 'liquide'
                                            ? 'border-green-500 bg-green-500/10'
                                            : 'border-slate-600 hover:border-slate-500'
                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        <Wallet className="w-12 h-12 text-green-400 mx-auto mb-3" />
                                        <p className="text-white font-semibold text-center">Paiement Liquide</p>
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod('qr')}
                                        disabled={paymentLoading}
                                        className={`p-6 rounded-lg border-2 transition-all ${paymentMethod === 'qr'
                                            ? 'border-green-500 bg-green-500/10'
                                            : 'border-slate-600 hover:border-slate-500'
                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
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
                                                                disabled={paymentLoading}
                                                                className="w-full border-2 border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-slate-700 text-white disabled:opacity-50"
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
                                                                disabled={paymentLoading}
                                                                className="w-full border-2 border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-slate-700 text-white disabled:opacity-50"
                                                            />
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => supprimerLigneMonnaie(index)}
                                                        disabled={monnaies.length === 1 || paymentLoading}
                                                        className="mt-7 bg-red-500 hover:bg-red-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-colors disabled:opacity-50"
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
                                                disabled={paymentLoading}
                                                className="w-full border-2 border-dashed border-slate-600 hover:border-green-500 text-slate-400 hover:text-green-400 py-3 rounded-lg transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
                                                disabled={paymentLoading || qrLoading}
                                            />
                                            <label htmlFor="qr-upload" className={`cursor-pointer ${(paymentLoading || qrLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                {qrLoading ? (
                                                    <div className="flex flex-col items-center">
                                                        <Loader2 className="w-12 h-12 text-green-400 animate-spin mb-4" />
                                                        <p className="text-slate-400">Chargement du QR code...</p>
                                                    </div>
                                                ) : qrPreview ? (
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
                                disabled={!canProceedToPayment || paymentLoading}
                                className="px-8 py-3 bg-green-500 hover:bg-green-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                            >
                                {paymentLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                Payer
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setStep(1)}
                                disabled={paymentLoading}
                                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                Retour
                            </button>
                            <button
                                onClick={handlePayment}
                                disabled={!canCompletePayment || paymentLoading}
                                className="px-8 py-3 bg-green-500 hover:bg-green-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                            >
                                {paymentLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {paymentLoading ? 'Traitement...' : 'Confirmer le paiement'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
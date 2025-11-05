"use client";
import { Canvas } from "@react-three/fiber";
import "./page.css";
import { OrbitControls } from "@react-three/drei";
import { Distributeur3D } from "@/components/Model3D/Distributeur3D";
import { Physics } from "@react-three/rapier";
import { useRouter } from "next/navigation";
import { EcranListeBoisson } from "@/components/EcranListeBoisson/EcranListeBoisson";
import { useState } from "react";
import { X, CheckCircle, Package, Coins, Receipt } from "lucide-react";
import { PaymentModal } from "@/components/BeveragePayementModal/BeveragePayementModal";

interface PaymentResult {
    status: string;
    shortfall: number;
    change: { monaie: number; quantite: number }[] | null;
    distributed: string;
    clientDebt: any;
}

interface CongratulationsModalProps {
    isOpen: boolean;
    onClose: () => void;
    paymentResult: PaymentResult | null;
    paymentMode: "CASH" | "QR" | null;
}

function CongratulationsModal({ isOpen, onClose, paymentResult, paymentMode }: CongratulationsModalProps) {
    if (!isOpen) return null;

    const getTotalChange = () => {
        if (!paymentResult?.change) return 0;
        return paymentResult.change.reduce((total, item) => total + (item.monaie * item.quantite), 0);
    };

    const getDistributedItems = () => {
        if (!paymentResult?.distributed) return [];
        try {
            // Essayer de parser si c'est un format JSON ou liste
            if (paymentResult.distributed.startsWith('[') && paymentResult.distributed.endsWith(']')) {
                return JSON.parse(paymentResult.distributed);
            }
            return [paymentResult.distributed];
        } catch {
            return [paymentResult.distributed];
        }
    };

    const distributedItems = getDistributedItems();

    return (
        <div className="fixed inset-0 z-80 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-all duration-300">
            <div className="relative w-[90%] md:w-[500px] max-h-[90vh] bg-gradient-to-br from-green-900/90 to-emerald-800/90 rounded-2xl shadow-2xl border border-emerald-500/30 overflow-hidden flex flex-col animate-fadeIn">
                {/* Header */}
                <div className="bg-emerald-800/50 border-b border-emerald-500/30 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <CheckCircle className="w-8 h-8 text-emerald-300" />
                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                Paiement Réussi !
                            </h2>
                            <p className="text-sm text-emerald-300 mt-1">
                                Transaction effectuée avec succès
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-emerald-700/50 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6 text-emerald-300" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-6">
                        {/* Message de succès */}
                        <div className="text-center">
                            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-10 h-10 text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">
                                Merci pour votre achat !
                            </h3>
                            <p className="text-emerald-200">
                                Votre paiement a été traité avec succès via {paymentMode === "CASH" ? "paiement liquide" : "QR code"}.
                            </p>
                        </div>

                        {/* Détails de la transaction */}
                        <div className="bg-emerald-800/30 border border-emerald-500/20 rounded-lg p-4">
                            <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                <Receipt className="w-5 h-5" />
                                Détails de la transaction
                            </h4>
                            
                            {/* Produits distribués */}
                            {distributedItems.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-emerald-300 text-sm font-medium mb-2">Produits distribués :</p>
                                    <div className="space-y-1">
                                        {distributedItems.map((item:any, index:number) => (
                                            <div key={index} className="flex items-center gap-2 text-white">
                                                <Package className="w-4 h-4 text-emerald-400" />
                                                <span>{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Monnaie rendue */}
                            {paymentResult?.change && paymentResult.change.length > 0 && getTotalChange() > 0 && (
                                <div className="mb-4">
                                    <p className="text-emerald-300 text-sm font-medium mb-2">Monnaie rendue :</p>
                                    <div className="space-y-2">
                                        {paymentResult.change.map((item, index) => (
                                            <div key={index} className="flex justify-between items-center text-white">
                                                <div className="flex items-center gap-2">
                                                    <Coins className="w-4 h-4 text-emerald-400" />
                                                    <span>Pièce de {item.monaie} Ar</span>
                                                </div>
                                                <span className="font-semibold">x{item.quantite}</span>
                                            </div>
                                        ))}
                                        <div className="pt-2 border-t border-emerald-500/20 flex justify-between text-emerald-300 font-semibold">
                                            <span>Total rendu :</span>
                                            <span>{getTotalChange()} Ar</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Statut */}
                            <div className="pt-3 border-t border-emerald-500/20">
                                <div className="flex justify-between text-white">
                                    <span>Statut :</span>
                                    <span className={`font-semibold ${
                                        paymentResult?.status === "OK" ? "text-emerald-400" : "text-yellow-400"
                                    }`}>
                                        {paymentResult?.status === "OK" ? "Succès" : paymentResult?.status}
                                    </span>
                                </div>
                                {paymentResult?.shortfall && paymentResult.shortfall > 0 && (
                                    <div className="flex justify-between text-yellow-400 mt-1">
                                        <span>Manquant :</span>
                                        <span className="font-semibold">{paymentResult.shortfall} Ar</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Message de confirmation */}
                        <div className="text-center">
                            <p className="text-emerald-200 text-sm">
                                Votre boisson sera distribuée dans quelques instants.
                                <br />
                                Bonne dégustation !
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-emerald-800/50 border-t border-emerald-500/30 p-6">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-lg transition-colors"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function DistributeurPage() {
    const router = useRouter();
    const [showListeBoissonDialog, setShowListeBoissonDialog] = useState(false);
    const [showHtmlInWebGL, setShowHtmlInWebgl] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showCongratulations, setShowCongratulations] = useState(false);
    const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
    const [paymentMode, setPaymentMode] = useState<"CASH" | "QR" | null>(null);

    const openListeBoissonModal = () => {
        setShowHtmlInWebgl(true)
        setShowListeBoissonDialog(true);
    };

    const closeListeBoissonModal = () => {
        setShowHtmlInWebgl(false)
        setShowListeBoissonDialog(false);
    };

    const afficherInterfaceAchat = () => {
        setShowHtmlInWebgl(true);
        setShowPaymentModal(true);
    }

    const handleClosePayementModal = () => {
        setShowHtmlInWebgl(false)
        setShowPaymentModal(false);
    }

    const handleCloseCongratulations = () => {
        setShowCongratulations(false);
        setPaymentResult(null);
        setPaymentMode(null);
        setShowHtmlInWebgl(false); // ← AJOUT IMPORTANT ICI
    }

    const onPayementEffectue = (mode: "CASH" | "QR", result: any) => {
        handleClosePayementModal();
        console.log(`Paiement effectué via ${mode}`, result);
        
        // Stocker les résultats et afficher le modal de félicitations
        setPaymentResult(result);
        setPaymentMode(mode);
        setShowCongratulations(true);
        setShowHtmlInWebgl(true);
    }

    return (
        <main className="main relative">
            {/* Bouton principal */}
            <div className="absolute z-10 top-0 right-0 p-4 flex gap-3">
                <button
                    onClick={() => router.push("/")}
                    className="p-2 px-5 rounded bg-blue-500 hover:bg-blue-400 active:bg-blue-600 cursor-pointer font-semibold text-white shadow-md"
                >
                    Sortir
                </button>
            </div>

            {/* Canvas 3D */}
            <Canvas
                className="canvas"
                shadows
                camera={{ position: [0, 3, 10], fov: 50 }}
            >
                {/* Lumières */}
                <ambientLight intensity={0.4} />
                <directionalLight
                    position={[10, 6, 12]}
                    intensity={1.5}
                    castShadow
                    shadow-mapSize-width={2048}
                    shadow-mapSize-height={2048}
                />
                <directionalLight position={[-5, 5, -5]} intensity={0.6} />
                <pointLight position={[-8, 4, -2]} intensity={1} color="#ffffff" />
                <hemisphereLight
                    color="#ffffff"
                    groundColor="#444444"
                    intensity={0.5}
                />

                {/* Contrôles caméra */}
                <OrbitControls
                    enableZoom={true}
                    enableRotate={false}
                    panSpeed={2}
                    maxDistance={15}
                    minDistance={8}
                />

                {/* Monde physique et modèle */}
                <Physics debug={false} gravity={[0, -9.81, 0]}>
                    <Distributeur3D 
                        afficherInterfaceAchat={afficherInterfaceAchat} 
                        onClickExpandEcranListeBoisson={openListeBoissonModal} 
                        showHtmlInWebGL={showHtmlInWebGL}
                    />
                </Physics>
            </Canvas>

            {/* Modal Liste Boisson */}
            {showListeBoissonDialog && (
                <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-all duration-300">
                    <div className="relative w-[90%] md:w-[70%] lg:w-[60%] h-[80%] bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col animate-fadeIn">
                        {/* Contenu du modal */}
                        <div className="flex-1 overflow-hidden rounded-b-2xl">
                            <EcranListeBoisson onExpandClick={closeListeBoissonModal} />
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Paiement */}
            {showPaymentModal && (
                <PaymentModal 
                    onPayementEffectue={onPayementEffectue} 
                    handleClose={handleClosePayementModal}
                />
            )}

            {/* Modal de Félicitations */}
            <CongratulationsModal
                isOpen={showCongratulations}
                onClose={handleCloseCongratulations}
                paymentResult={paymentResult}
                paymentMode={paymentMode}
            />
        </main>
    );
}
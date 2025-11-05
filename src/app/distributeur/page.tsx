"use client";
import { Canvas } from "@react-three/fiber";
import "./page.css";
import { OrbitControls } from "@react-three/drei";
import { Distributeur3D } from "@/components/Model3D/Distributeur3D";
import { Physics } from "@react-three/rapier";
import { useRouter } from "next/navigation";
import { EcranListeBoisson } from "@/components/EcranListeBoisson/EcranListeBoisson";
import { useState } from "react";
import { X } from "lucide-react";
import { PaymentModal } from "@/components/BeveragePayementModal/BeveragePayementModal";
import { set } from "zod";

export default function DistributeurPage() {
    const router = useRouter();
    const [showListeBoissonDialog, setShowListeBoissonDialog] = useState(false);
    const [showHtmlInWebGL, setShowHtmlInWebgl] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

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

    const onPayementEffectue = (mode:"CASH" | "QR", result: any) => {
        handleClosePayementModal()
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
                    <Distributeur3D afficherInterfaceAchat={afficherInterfaceAchat} onClickExpandEcranListeBoisson={openListeBoissonModal} showHtmlInWebGL={showHtmlInWebGL}/>
                </Physics>
            </Canvas>

            {/* Modal */}
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

            {showPaymentModal && <PaymentModal onPayementEffectue={onPayementEffectue} handleClose={handleClosePayementModal}/>}
        </main>
    );
}

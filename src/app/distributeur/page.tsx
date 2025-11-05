"use client"
import { Canvas } from "@react-three/fiber"
import "./page.css"
import { OrbitControls } from "@react-three/drei"
import { Distributeur3D } from "@/components/Model3D/Distributeur3D"
import { Physics } from "@react-three/rapier"
import { useRouter } from "next/navigation"
import { EcranListeBoisson } from "@/components/EcranListeBoisson/EcranListeBoisson"

export default function DistributeurPage() {
    const router = useRouter();

    return (
        <main className="main">
            <div className="absolute z-10 top-0 right-0 p-4">
                <button onClick={()=>router.push("/")} className="p-2 px-5 rounded bg-blue-500 hover:bg-blue-400 action:bg-blue-600 cursor-pointer">Sortir</button>
            </div>
            <EcranListeBoisson />
            <Canvas
                className="canvas"
                shadows
                camera={{ position: [0, 4, 10], fov: 50, }}
            >
                {/* Lumière ambiante - éclairage global doux */}
                <ambientLight intensity={0.4} />

                {/* Lumière directionnelle principale - simule le soleil */}
                <directionalLight
                    position={[10, 6, 12]}
                    intensity={1.5}
                    castShadow
                    shadow-mapSize-width={2048}
                    shadow-mapSize-height={2048}
                    shadow-camera-far={50}
                    shadow-camera-left={-10}
                    shadow-camera-right={10}
                    shadow-camera-top={10}
                    shadow-camera-bottom={-10}
                />

                {/* Lumière de remplissage - adoucit les ombres */}
                <directionalLight
                    position={[-5, 5, -5]}
                    intensity={0.6}
                />

                {/* Lumière ponctuelle - met en valeur l'écran */}
                <pointLight
                    position={[-8, 4, -2]}
                    intensity={1}
                    color="#ffffff"
                />

                {/* Lumière hémisphérique - simule la lumière du ciel et du sol */}
                <hemisphereLight
                    color="#ffffff"
                    groundColor="#444444"
                    intensity={0.5}
                />

                <OrbitControls
                    enableZoom={true}
                    enableRotate={true}
                    panSpeed={2}
                    maxDistance={15}
                    minDistance={8}
                />
                <Physics debug={true} gravity={[0, -9.81, 0]}>
                    <Distributeur3D />
                </Physics>
            </Canvas>
        </main>
    )
}
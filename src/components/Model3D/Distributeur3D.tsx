import React, { JSX, useRef, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { Group, Mesh } from 'three'
import { GLTF } from 'three-stdlib'
import * as THREE from 'three'

type GLTFResult = GLTF & {
    nodes: {
        Cube: Mesh
        Cube_1: Mesh
        Cube_2: Mesh
        Cube001: Mesh
        Cube001_1: Mesh
        Cube001_2: Mesh
        Cube001_3: Mesh
        Vitre: Mesh
        Plane: Mesh
        Etage_1: Mesh
        Etage_2: Mesh
        Etage_3: Mesh
        Etage_4: Mesh
    }
    materials: {
        DistributeurBaseMat: THREE.Material
        DistributeurContourGris: THREE.Material
        PocheMaterial: THREE.Material
        Screen: THREE.Material
        GlassMaterial: THREE.Material
        EtageMaterial: THREE.Material
    }
}

interface Scene3DProps {
    props?: JSX.IntrinsicElements['group']
    scale?: number
    position?: [number, number, number]
    rotation?: [number, number, number]
}

export function Scene3D({
    props,
    scale = 1,
    position = [0, -1, 0],
    rotation = [0, -Math.PI / 2, 0]
}: Scene3DProps) {
    const group = useRef<Group>(null)
    const { nodes, materials } = useGLTF('/distributeur_glb.glb') as unknown as GLTFResult

    console.log("Data GLTF des nœuds :", nodes);
    console.log("Data GLTF des matériaux :", materials);
    

    // Matériau de verre réaliste optimisé
    const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0,
        roughness: 0.05,              // Plus lisse pour un verre plus réaliste
        transmission: 0.95,            // Transmission élevée pour la transparence
        thickness: 0.5,
        ior: 1.5,                      // Indice de réfraction du verre (crucial!)
        envMapIntensity: 1.5,          // Augmenté pour plus de réflexions
        clearcoat: 1,
        clearcoatRoughness: 0.05,      // Plus lisse
        transparent: true,
        opacity: 0.65,                    // Utilisez transmission au lieu d'opacity
        side: THREE.DoubleSide,
        reflectivity: 0.5,             // Contrôle des réflexions
        attenuationColor: 0xffffff,    // Couleur d'atténuation de la lumière
        attenuationDistance: 0.5,      // Distance d'atténuation
    });

    return (
        <group
            ref={group}
            {...props}
            dispose={null}
            rotation={rotation}
            position={position}
            scale={scale}
        >
            {/* Partie principale gauche du distributeur */}
            <group position={[-10.642, 3.079, 0.556]} scale={[1.041, 3.079, 1.513]}>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube.geometry}
                    material={materials.DistributeurBaseMat}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube_1.geometry}
                    material={materials.DistributeurContourGris}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube_2.geometry}
                    material={materials.PocheMaterial}
                />
            </group>

            {/* Partie écran droite du distributeur */}
            <group position={[-10.642, 3.079, -1.689]} scale={[1.041, 3.079, 0.682]}>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube001.geometry}
                    material={materials.DistributeurBaseMat}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube001_1.geometry}
                    material={materials.DistributeurContourGris}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube001_2.geometry}
                    material={materials.DistributeurContourGris}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube001_3.geometry}
                    material={materials.Screen}
                />
            </group>

            {/* Vitre avec matériau de verre amélioré */}
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Vitre.geometry}
                material={glassMaterial}
                position={[-9.638, 3.876, 0.532]}
                scale={[0.038, 1.995, 1.292]}
            />

            {/* Base/Plane */}
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Plane.geometry}
                material={nodes.Plane.material}
                scale={[5.107, 1, 5.102]}
            />

            {/* Étages internes */}
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Etage_1.geometry}
                material={materials.EtageMaterial}
                position={[-10.824, 2.472, 0.472]}
                scale={[0.782, 0.044, 1.363]}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Etage_2.geometry}
                material={materials.EtageMaterial}
                position={[-10.824, 3.309, 0.472]}
                scale={[0.782, 0.044, 1.363]}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Etage_3.geometry}
                material={materials.EtageMaterial}
                position={[-10.824, 4.213, 0.472]}
                scale={[0.782, 0.044, 1.363]}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Etage_4.geometry}
                material={materials.EtageMaterial}
                position={[-10.824, 5.078, 0.472]}
                scale={[0.782, 0.044, 1.363]}
            />
        </group>
    )
}

// Hook personnalisé pour le préchargement
export function useDistributeur() {
    return useGLTF('/distributeur_glb.glb') as unknown as GLTFResult
}

// Composant optimisé avec React.memo
export const Distributeur3D = React.memo(Scene3D)

// Préchargement
useGLTF.preload('/distributeur_glb.glb')
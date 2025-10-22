import React, { JSX, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { Group, Mesh } from 'three'
import { GLTF } from 'three-stdlib'
import * as THREE from 'three'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { Canette3D } from './Canette'

type GLTFResult = GLTF & {
    nodes: {
        Distributeur_1: Mesh
        Distributeur_2: Mesh
        Distributeur_3: Mesh
        Distributeur_4: Mesh
        Paiement_1: Mesh
        Paiement_2: Mesh
        Paiement_3: Mesh
        Paiement_4: Mesh
        Vitre: Mesh
        Plane: Mesh
        Etage_1_1: Mesh
        Etage_1_2: Mesh
        Etage_1_3: Mesh
        Etage_1_4: Mesh
        Etage_1_5: Mesh
        Etage_1_6: Mesh
        Etage_1_7: Mesh
        Etage_2_1: Mesh
        Etage_2_2: Mesh
        Etage_2_3: Mesh
        Etage_2_4: Mesh
        Etage_2_5: Mesh
        Etage_2_6: Mesh
        Etage_2_7: Mesh
        Etage_3_1: Mesh
        Etage_3_2: Mesh
        Etage_3_3: Mesh
        Etage_3_4: Mesh
        Etage_3_5: Mesh
        Etage_3_6: Mesh
        Etage_3_7: Mesh
        Etage_4_1: Mesh
        Etage_4_2: Mesh
        Etage_4_3: Mesh
        Etage_4_4: Mesh
        Etage_4_5: Mesh
        Etage_4_6: Mesh
        Etage_4_7: Mesh
    }
    materials: {
        DistributeurBaseMat: THREE.Material
        DistributeurContourGris: THREE.Material
        PocheMaterial: THREE.Material
        InsideDistributeurMaterial: THREE.Material
        Screen: THREE.Material
        GlassMaterial: THREE.Material
        EtageMaterialBase: THREE.Material
        EtageP1Material: THREE.Material
        EtageP2Material: THREE.Material
        EtageP3Material: THREE.Material
        EtageP4Material: THREE.Material
        EtageP5Material: THREE.Material
        EtageP6Material: THREE.Material
    }
}

interface Scene3DProps {
    props?: JSX.IntrinsicElements['group']
}

export function Scene3D({ props }: Scene3DProps) {
    const group = useRef<Group>(null)
    const { nodes, materials } = useGLTF('/distributeur_glb.glb') as unknown as GLTFResult

    // Matériau de verre réaliste optimisé
    const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0,
        roughness: 0.03,
        transmission: 0.95,
        thickness: 0.5,
        ior: 1.5,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        transparent: true,
        opacity: 0, //TODO: remettre à 0.3 après test
        reflectivity: 0.5,
        attenuationColor: 0xffffff,
        attenuationDistance: 0.5,
    })

    return (
        <group ref={group} {...props} dispose={null} rotation={[0, - Math.PI, 0]} position={[-6, -3, 2]} scale={1}>
            {/* Partie principale distributeur */}
            <group
                position={[-4.289, 3.217, 4.753]}
                rotation={[0, Math.PI / 2, 0]}
                scale={[1.265, 3.079, 1.513]}
            >
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Distributeur_1.geometry}
                    material={materials.DistributeurBaseMat}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Distributeur_2.geometry}
                    material={materials.DistributeurContourGris}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Distributeur_3.geometry}
                    material={materials.PocheMaterial}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Distributeur_4.geometry}
                    material={materials.InsideDistributeurMaterial}
                />
            </group>
            <RigidBody type="fixed"> //Colliders distributeur
                <CuboidCollider //Back - inside distributeur
                    args={[0, 2, 1.25]}
                    position={[-4.289, 4, 5.9]}
                    rotation={[0, Math.PI / 2, 0]}
                />

                <CuboidCollider //Left - inside distributeur
                    args={[1, 2, 0]}
                    position={[-3.05, 4, 4.9]}
                    rotation={[0, Math.PI / 2, 0]}
                />

                <CuboidCollider //Right - inside distributeur
                    args={[1, 2, 0]}
                    position={[-5.53, 4, 4.9]}
                    rotation={[0, Math.PI / 2, 0]}
                />

            </RigidBody>

            {/* Partie écran/paiement */}
            <group
                position={[-6.535, 3.217, 4.753]}
                rotation={[0, Math.PI / 2, 0]}
                scale={[1.265, 3.079, 0.682]}
            >
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Paiement_1.geometry}
                    material={materials.DistributeurBaseMat}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Paiement_2.geometry}
                    material={materials.DistributeurContourGris}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Paiement_3.geometry}
                    material={materials.DistributeurContourGris}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Paiement_4.geometry}
                    material={materials.Screen}
                />
            </group>

            {/* Vitre avec matériau de verre amélioré */}
            <RigidBody type="fixed">
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Vitre.geometry}
                    material={glassMaterial}
                    position={[-4.313, 4.014, 3.518]}
                    rotation={[0, Math.PI / 2, 0]}
                    scale={[0.046, 1.995, 1.292]}
                />
            </RigidBody>

            {/* Base/Plane */}
            <RigidBody type="fixed">
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Plane.geometry}
                    material={nodes.Plane.material}
                    position={[-4.845, 0, -5.979]}
                    rotation={[0, Math.PI / 2, 0]}
                    scale={[5.107, 1, 5.102]}
                />
            </RigidBody>

            {/* Étage 1 */}
            <group
                position={[-4.373, 5.217, 4.917]}
                rotation={[-0.026, 1.571, 0]}
                scale={[0.95, 0.044, 1.363]}
            >
                <mesh castShadow receiveShadow geometry={nodes.Etage_1_1.geometry} material={materials.EtageMaterialBase} />
                <RigidBody type="fixed">
                    <mesh castShadow receiveShadow geometry={nodes.Etage_1_2.geometry} material={materials.EtageP1Material} />
                    <mesh castShadow receiveShadow geometry={nodes.Etage_1_3.geometry} material={materials.EtageP2Material} />
                    <mesh castShadow receiveShadow geometry={nodes.Etage_1_4.geometry} material={materials.EtageP3Material} />
                    <mesh castShadow receiveShadow geometry={nodes.Etage_1_5.geometry} material={materials.EtageP4Material} />
                    <mesh castShadow receiveShadow geometry={nodes.Etage_1_6.geometry} material={materials.EtageP5Material} />
                    <mesh castShadow receiveShadow geometry={nodes.Etage_1_7.geometry} material={materials.EtageP6Material} />
                </RigidBody>
            </group>

            {/* Étage 2 */}
            <group
                position={[-4.373, 5.217, 4.917]}
                rotation={[-0.026, 1.571, 0]}
                scale={[0.95, 0.044, 1.363]}
            >
                <mesh castShadow receiveShadow geometry={nodes.Etage_2_1.geometry} material={materials.EtageMaterialBase} />
                <RigidBody type="fixed">
                    <mesh castShadow receiveShadow geometry={nodes.Etage_2_2.geometry} material={materials.EtageP1Material} />
                    <mesh castShadow receiveShadow geometry={nodes.Etage_2_3.geometry} material={materials.EtageP2Material} />
                    <mesh castShadow receiveShadow geometry={nodes.Etage_2_4.geometry} material={materials.EtageP3Material} />
                    <mesh castShadow receiveShadow geometry={nodes.Etage_2_5.geometry} material={materials.EtageP4Material} />
                    <mesh castShadow receiveShadow geometry={nodes.Etage_2_6.geometry} material={materials.EtageP5Material} />
                    <mesh castShadow receiveShadow geometry={nodes.Etage_2_7.geometry} material={materials.EtageP6Material} />
                </RigidBody>
            </group>

            {/* Étage 3 */}
            <group
                position={[-4.373, 5.217, 4.917]}
                rotation={[-0.026, 1.571, 0]}
                scale={[0.95, 0.044, 1.363]}
            >
                <mesh castShadow receiveShadow geometry={nodes.Etage_3_1.geometry} material={materials.EtageMaterialBase} />
                <RigidBody type="fixed">
                    <mesh castShadow receiveShadow geometry={nodes.Etage_3_2.geometry} material={materials.EtageP1Material} />
                    <mesh castShadow receiveShadow geometry={nodes.Etage_3_3.geometry} material={materials.EtageP2Material} />
                    <mesh castShadow receiveShadow geometry={nodes.Etage_3_4.geometry} material={materials.EtageP3Material} />
                    <mesh castShadow receiveShadow geometry={nodes.Etage_3_5.geometry} material={materials.EtageP4Material} />
                    <mesh castShadow receiveShadow geometry={nodes.Etage_3_6.geometry} material={materials.EtageP5Material} />
                    <mesh castShadow receiveShadow geometry={nodes.Etage_3_7.geometry} material={materials.EtageP6Material} />
                </RigidBody>
            </group>

            {/* Étage 4 */}
            <group
                position={[-4.373, 5.217, 4.917]}
                rotation={[-0.026, 1.571, 0]}
                scale={[0.95, 0.044, 1.363]}
            >
                <mesh castShadow receiveShadow geometry={nodes.Etage_4_1.geometry} material={materials.EtageMaterialBase} />
                <RigidBody type="fixed">
                    <mesh castShadow receiveShadow geometry={nodes.Etage_4_2.geometry} material={materials.EtageP1Material} />
                    <mesh castShadow receiveShadow geometry={nodes.Etage_4_3.geometry} material={materials.EtageP2Material} />
                    <mesh castShadow receiveShadow geometry={nodes.Etage_4_4.geometry} material={materials.EtageP3Material} />
                    <mesh castShadow receiveShadow geometry={nodes.Etage_4_5.geometry} material={materials.EtageP4Material} />
                    <mesh castShadow receiveShadow geometry={nodes.Etage_4_6.geometry} material={materials.EtageP5Material} />
                    <mesh castShadow receiveShadow geometry={nodes.Etage_4_7.geometry} material={materials.EtageP6Material} />
                </RigidBody>
            </group>

            <Canette3D position={[-4.9, 3.76, 5.2]} />
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
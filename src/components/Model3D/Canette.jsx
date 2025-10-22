
import React from 'react'
import { useGLTF } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'

export function Canette3D(props) {
    const { nodes, materials } = useGLTF('/canette.glb')
    return (
        <RigidBody colliders="cuboid">
            <group {...props} dispose={null}>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Petit.geometry}
                scale={[0.132, 0.187, 0.132]}
            />
        </group>
        </RigidBody>
    )
}

useGLTF.preload('/canette.glb')
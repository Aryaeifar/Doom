"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { Group } from "three";

function noRaycast() {
  return undefined;
}

export function Gun({ kick }: { kick: number }) {
  const root = useRef<Group>(null);
  const model = useRef<Group>(null);
  const flash = useRef<Group>(null);
  const shownKick = useRef(0);
  const getThree = useThree((s) => s.get);

  useFrame((_, dt) => {
    const { camera } = getThree();
    const group = root.current;
    const hands = model.current;
    if (!group || !hands) return;
    group.position.copy(camera.position);
    group.quaternion.copy(camera.quaternion);

    const speed = kick > shownKick.current ? 28 : 10;
    shownKick.current += (kick - shownKick.current) * Math.min(1, dt * speed);
    const k = shownKick.current;

    hands.position.set(0.28, -0.32 + k * 0.07, -0.55 - k * 0.14);
    hands.rotation.set(0.12 + k * 0.38, 0.18, 0.04 + k * 0.05);

    if (flash.current) {
      const lit = k > 0.55;
      flash.current.visible = lit;
      const s = lit ? 0.7 + k * 0.6 : 0.01;
      flash.current.scale.setScalar(s);
    }
  });

  return (
    <group ref={root}>
      <group ref={model}>
        <mesh raycast={noRaycast} position={[0, 0.02, 0.12]}>
          <boxGeometry args={[0.08, 0.14, 0.28]} />
          <meshStandardMaterial color="#3a2a1c" roughness={0.8} />
        </mesh>
        <mesh raycast={noRaycast} position={[0, 0.04, -0.12]}>
          <boxGeometry args={[0.07, 0.08, 0.42]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.35} />
        </mesh>
        <mesh raycast={noRaycast} position={[0, 0.045, -0.38]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.028, 0.028, 0.22, 10]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.25} />
        </mesh>
        <mesh raycast={noRaycast} position={[0, -0.02, -0.08]}>
          <boxGeometry args={[0.06, 0.05, 0.16]} />
          <meshStandardMaterial color="#4a3424" />
        </mesh>
        <mesh raycast={noRaycast} position={[0, -0.08, 0.18]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.05, 0.14, 0.08]} />
          <meshStandardMaterial color="#2b1c12" />
        </mesh>
        <mesh raycast={noRaycast} position={[0.0, 0.09, -0.02]}>
          <boxGeometry args={[0.02, 0.04, 0.08]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        <group ref={flash} position={[0, 0.05, -0.52]} visible={false}>
          <mesh raycast={noRaycast}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshBasicMaterial color="#ffdd88" transparent opacity={0.95} />
          </mesh>
          <mesh raycast={noRaycast} rotation={[0, 0, Math.PI / 4]}>
            <planeGeometry args={[0.28, 0.08]} />
            <meshBasicMaterial
              color="#ffaa33"
              transparent
              opacity={0.8}
              depthWrite={false}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
}

"use client";

import { ROOM_HALF, ROOM_HEIGHT } from "./constants";

const wallThickness = 0.4;
const floorSize = ROOM_HALF * 2;

export function Arena() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[floorSize, floorSize]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_HEIGHT, 0]}>
        <planeGeometry args={[floorSize, floorSize]} />
        <meshStandardMaterial color="#1a1512" />
      </mesh>
      <mesh
        position={[0, ROOM_HEIGHT / 2, -ROOM_HALF]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[floorSize + wallThickness, ROOM_HEIGHT, wallThickness]} />
        <meshStandardMaterial color="#8b3a2a" />
      </mesh>
      <mesh position={[0, ROOM_HEIGHT / 2, ROOM_HALF]} receiveShadow castShadow>
        <boxGeometry args={[floorSize + wallThickness, ROOM_HEIGHT, wallThickness]} />
        <meshStandardMaterial color="#7a3424" />
      </mesh>
      <mesh
        position={[-ROOM_HALF, ROOM_HEIGHT / 2, 0]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[wallThickness, ROOM_HEIGHT, floorSize]} />
        <meshStandardMaterial color="#6e2f20" />
      </mesh>
      <mesh position={[ROOM_HALF, ROOM_HEIGHT / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[wallThickness, ROOM_HEIGHT, floorSize]} />
        <meshStandardMaterial color="#7e3826" />
      </mesh>
      <mesh position={[-4, 0.5, 2]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 1, 1.4]} />
        <meshStandardMaterial color="#4a3a2a" />
      </mesh>
      <mesh position={[5, 0.35, 4]} castShadow receiveShadow>
        <boxGeometry args={[1, 0.7, 1]} />
        <meshStandardMaterial color="#3d3328" />
      </mesh>
    </group>
  );
}

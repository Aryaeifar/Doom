"use client";

import { Billboard } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Group, MeshBasicMaterial, Vector3 } from "three";
import {
  ENEMY_ATTACK_COOLDOWN,
  ENEMY_ATTACK_RANGE,
  ENEMY_DAMAGE,
  ENEMY_SPEED,
  PLAYER_HEIGHT,
  PLAYER_RADIUS,
  ROOM_HALF,
} from "./constants";
import { useSpriteFrames } from "./useSpriteFrames";
import { playEnemyAlert, playEnemyAttack, playEnemyGrowl } from "./sound";

const toward = new Vector3();

const MONSTERS = [
  {
    frames: [
      "/enemies/trooa1.png",
      "/enemies/troob1.png",
      "/enemies/trooc1.png",
      "/enemies/trood1.png",
    ],
    width: 1.35,
    height: 2.45,
  },
  {
    frames: [
      "/enemies/sarga1.png",
      "/enemies/sargb1.png",
      "/enemies/sargc1.png",
      "/enemies/sargd1.png",
    ],
    width: 2.1,
    height: 1.55,
  },
  {
    frames: [
      "/enemies/heada1.png",
      "/enemies/headb1.png",
      "/enemies/headc1.png",
      "/enemies/headd1.png",
    ],
    width: 1.9,
    height: 1.85,
  },
  {
    frames: [
      "/enemies/possa1.png",
      "/enemies/possb1.png",
      "/enemies/possc1.png",
      "/enemies/possd1.png",
    ],
    width: 1.2,
    height: 2.05,
  },
] as const;

export function Enemy({
  position,
  kind,
  onDamage,
  active,
}: {
  position: [number, number, number];
  kind: number;
  onDamage: (amount: number) => void;
  active: boolean;
}) {
  const monster = MONSTERS[kind % MONSTERS.length];
  const frames = useMemo(() => [...monster.frames], [monster]);
  const textures = useSpriteFrames(frames);
  const group = useRef<Group>(null);
  const material = useRef<MeshBasicMaterial>(null);
  const cooldown = useRef(0);
  const frame = useRef(0);
  const anim = useRef(0);
  const growlCd = useRef(1.2);
  const getThree = useThree((s) => s.get);

  useEffect(() => {
    if (!active) return;
    playEnemyAlert(kind);
  }, [active, kind]);

  useFrame((_, dt) => {
    const root = group.current;
    if (!root) return;
    const { camera } = getThree();

    if (material.current && textures) {
      material.current.map = textures[frame.current];
    }

    if (!active) return;

    toward.set(
      camera.position.x - root.position.x,
      0,
      camera.position.z - root.position.z,
    );
    const dist = toward.length();

    const stopAt = PLAYER_RADIUS + 0.7;
    if (dist > stopAt) {
      toward.multiplyScalar((ENEMY_SPEED * dt) / dist);
      root.position.x += toward.x;
      root.position.z += toward.z;
      const limit = ROOM_HALF - 0.8;
      root.position.x = Math.max(-limit, Math.min(limit, root.position.x));
      root.position.z = Math.max(-limit, Math.min(limit, root.position.z));
      anim.current += dt;
      if (anim.current > 0.18) {
        anim.current = 0;
        frame.current = (frame.current + 1) % 4;
      }
      growlCd.current -= dt;
      if (growlCd.current <= 0) {
        playEnemyGrowl(kind);
        growlCd.current = 2.2 + Math.random() * 1.2;
      }
    }

    cooldown.current = Math.max(0, cooldown.current - dt);
    const reach = Math.hypot(
      camera.position.x - root.position.x,
      camera.position.z - root.position.z,
    );
    if (reach <= ENEMY_ATTACK_RANGE && cooldown.current <= 0) {
      if (Math.abs(camera.position.y - PLAYER_HEIGHT) < 1) {
        onDamage(ENEMY_DAMAGE);
        playEnemyAttack(kind);
        cooldown.current = ENEMY_ATTACK_COOLDOWN;
      }
    }
  });

  return (
    <group ref={group} position={position} userData={{ enemy: true }}>
      <mesh position={[0, monster.height / 2, 0]} userData={{ enemy: true }}>
        <boxGeometry args={[monster.width * 0.55, monster.height * 0.9, 0.45]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {textures && (
        <Billboard position={[0, monster.height / 2, 0]}>
          <mesh>
            <planeGeometry args={[monster.width, monster.height]} />
            <meshBasicMaterial
              ref={material}
              map={textures[0]}
              transparent
              alphaTest={0.15}
              depthWrite={false}
            />
          </mesh>
        </Billboard>
      )}
    </group>
  );
}

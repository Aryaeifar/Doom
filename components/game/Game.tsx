"use client";

import { Canvas } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import { Arena } from "./Arena";
import { FIRE_RATE_MS, MAG_SIZE, MAX_HEALTH, RELOAD_MS, randomEnemyPosition } from "./constants";
import { Enemy } from "./Enemy";
import { Hud } from "./Hud";
import { Player } from "./Player";
import { playEmptySound, playEnemyDeath, playReloadSound, playShootSound, preloadMonsterSounds } from "./sound";

export default function Game() {
  const [locked, setLocked] = useState(false);
  const [kills, setKills] = useState(0);
  const [flash, setFlash] = useState(false);
  const [kick, setKick] = useState(0);
  const [ammo, setAmmo] = useState(MAG_SIZE);
  const [health, setHealth] = useState(MAX_HEALTH);
  const [reloading, setReloading] = useState(false);
  const [enemyPosition, setEnemyPosition] = useState<[number, number, number]>([
    0, 0, -4,
  ]);
  const [enemyKey, setEnemyKey] = useState(0);

  const ammoRef = useRef(MAG_SIZE);
  const reloadingRef = useRef(false);
  const healthRef = useRef(MAX_HEALTH);
  const lastShotRef = useRef(0);
  const enemyKeyRef = useRef(0);

  const dead = health <= 0;

  useEffect(() => {
    if (kick <= 0) return;
    const id = window.setTimeout(() => setKick(0), 120);
    return () => window.clearTimeout(id);
  }, [kick]);

  const tryShoot = useCallback(() => {
    if (healthRef.current <= 0 || reloadingRef.current) return false;
    const now = performance.now();
    if (now - lastShotRef.current < FIRE_RATE_MS) return false;
    if (ammoRef.current <= 0) {
      lastShotRef.current = now;
      playEmptySound();
      return false;
    }
    lastShotRef.current = now;
    ammoRef.current -= 1;
    setAmmo(ammoRef.current);
    playShootSound();
    setFlash(true);
    setKick(1);
    window.setTimeout(() => setFlash(false), 90);
    return true;
  }, []);

  const onReload = useCallback(() => {
    if (healthRef.current <= 0) return;
    if (reloadingRef.current || ammoRef.current >= MAG_SIZE) return;
    reloadingRef.current = true;
    setReloading(true);
    playReloadSound();
    window.setTimeout(() => {
      ammoRef.current = MAG_SIZE;
      setAmmo(MAG_SIZE);
      reloadingRef.current = false;
      setReloading(false);
    }, RELOAD_MS);
  }, []);

  const onHit = useCallback((playerX: number, playerZ: number) => {
    playEnemyDeath(enemyKeyRef.current);
    setKills((count) => count + 1);
    setEnemyPosition(randomEnemyPosition(playerX, playerZ));
    enemyKeyRef.current += 1;
    setEnemyKey(enemyKeyRef.current);
  }, []);

  const onDamage = useCallback((amount: number) => {
    if (healthRef.current <= 0) return;
    healthRef.current = Math.max(0, healthRef.current - amount);
    setHealth(healthRef.current);
  }, []);

  const restart = useCallback(() => {
    ammoRef.current = MAG_SIZE;
    healthRef.current = MAX_HEALTH;
    reloadingRef.current = false;
    setAmmo(MAG_SIZE);
    setHealth(MAX_HEALTH);
    setReloading(false);
    setKills(0);
    setEnemyPosition([0, 0, -4]);
    enemyKeyRef.current += 1;
    setEnemyKey(enemyKeyRef.current);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      e.preventDefault();
      if (healthRef.current <= 0) restart();
      void preloadMonsterSounds();
      document.querySelector("canvas")?.requestPointerLock();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [restart]);

  return (
    <div
      className={`relative h-screen w-screen overflow-hidden bg-black ${locked && !dead ? "cursor-none" : "cursor-pointer"}`}
    >
      <Canvas
        shadows
        camera={{ fov: 75, near: 0.1, far: 80 }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <color attach="background" args={["#1a1210"]} />
        <fog attach="fog" args={["#1a1210", 22, 45]} />
        <ambientLight intensity={0.55} />
        <hemisphereLight args={["#e8dcc8", "#3a2018", 0.7]} />
        <pointLight
          position={[0, 3.2, 0]}
          intensity={60}
          distance={28}
          color="#ffcc88"
          castShadow
        />
        <Arena />
        <Enemy
          key={enemyKey}
          kind={enemyKey}
          position={enemyPosition}
          onDamage={onDamage}
          active={locked && !dead}
        />
        <Player
          onLockChange={setLocked}
          tryShoot={tryShoot}
          onReload={onReload}
          onHit={onHit}
          kick={kick}
          canPlay={locked && !dead}
        />
      </Canvas>
      <Hud
        locked={locked}
        kills={kills}
        flash={flash}
        health={health}
        ammo={ammo}
        magSize={MAG_SIZE}
        reloading={reloading}
        dead={dead}
      />
    </div>
  );
}

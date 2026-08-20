"use client";

import { PointerLockControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Object3D, Raycaster, Vector2, Vector3 } from "three";
import {
  MOVE_SPEED,
  PLAYER_HEIGHT,
  PLAYER_RADIUS,
  ROOM_HALF,
} from "./constants";
import { Gun } from "./Gun";

const ndc = new Vector2(0, 0);
const front = new Vector3();
const right = new Vector3();
const move = new Vector3();
const raycaster = new Raycaster();

function isEnemyObject(obj: Object3D | null): boolean {
  while (obj) {
    if (obj.userData.enemy) return true;
    obj = obj.parent;
  }
  return false;
}

export function Player({
  onLockChange,
  tryShoot,
  onReload,
  onHit,
  kick,
  canPlay,
}: {
  onLockChange: (locked: boolean) => void;
  tryShoot: () => boolean;
  onReload: () => void;
  onHit: (playerX: number, playerZ: number) => void;
  kick: number;
  canPlay: boolean;
}) {
  const getThree = useThree((s) => s.get);
  const keys = useRef({ w: false, a: false, s: false, d: false });
  const firing = useRef(false);

  useEffect(() => {
    getThree().camera.position.set(0, PLAYER_HEIGHT, 6);
  }, [getThree]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent, down: boolean) => {
      if (e.code === "KeyW") keys.current.w = down;
      if (e.code === "KeyA") keys.current.a = down;
      if (e.code === "KeyS") keys.current.s = down;
      if (e.code === "KeyD") keys.current.d = down;
    };
    const down = (e: KeyboardEvent) => onKey(e, true);
    const up = (e: KeyboardEvent) => onKey(e, false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      const { camera, scene, gl } = getThree();
      if (document.pointerLockElement !== gl.domElement) return;
      if (!canPlay) return;

      if (e.button === 2) {
        e.preventDefault();
        onReload();
        return;
      }
      if (e.button !== 0) return;
      firing.current = true;
      const fired = tryShoot();
      if (!fired) return;
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObjects(scene.children, true);
      const first = hits[0];
      if (first && isEnemyObject(first.object)) {
        onHit(camera.position.x, camera.position.z);
      }
    };
    const onMouseUp = (e: MouseEvent) => {
      if (e.button === 0) firing.current = false;
    };
    const preventMenu = (e: Event) => e.preventDefault();
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("contextmenu", preventMenu);
    return () => {
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("contextmenu", preventMenu);
    };
  }, [canPlay, getThree, onHit, onReload, tryShoot]);

  useFrame((state, dt) => {
    if (!canPlay) return;
    const { camera, scene, gl } = state;

    if (firing.current && document.pointerLockElement === gl.domElement) {
      const fired = tryShoot();
      if (fired) {
        raycaster.setFromCamera(ndc, camera);
        const hits = raycaster.intersectObjects(scene.children, true);
        const first = hits[0];
        if (first && isEnemyObject(first.object)) {
          onHit(camera.position.x, camera.position.z);
        }
      }
    }
    camera.getWorldDirection(front);
    front.y = 0;
    if (front.lengthSq() > 0) front.normalize();
    right.crossVectors(front, camera.up).normalize();

    move.set(0, 0, 0);
    if (keys.current.w) move.add(front);
    if (keys.current.s) move.sub(front);
    if (keys.current.a) move.sub(right);
    if (keys.current.d) move.add(right);

    if (move.lengthSq() > 0) {
      move.normalize().multiplyScalar(MOVE_SPEED * dt);
      camera.position.x += move.x;
      camera.position.z += move.z;
    }

    const limit = ROOM_HALF - PLAYER_RADIUS;
    camera.position.x = Math.max(-limit, Math.min(limit, camera.position.x));
    camera.position.z = Math.max(-limit, Math.min(limit, camera.position.z));
    camera.position.y = PLAYER_HEIGHT;
  });

  return (
    <>
      <PointerLockControls
        selector="#space-only-start"
        onLock={() => onLockChange(true)}
        onUnlock={() => {
          firing.current = false;
          onLockChange(false);
        }}
      />
      <Gun kick={kick} />
    </>
  );
}

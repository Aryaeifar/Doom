export const ROOM_HALF = 10;
export const ROOM_HEIGHT = 4;
export const PLAYER_HEIGHT = 1.6;
export const PLAYER_RADIUS = 0.45;
export const MOVE_SPEED = 6;
export const ENEMY_MIN_DISTANCE = 4;
export const ENEMY_SPEED = 2.4;
export const ENEMY_ATTACK_RANGE = 1.6;
export const ENEMY_DAMAGE = 14;
export const ENEMY_ATTACK_COOLDOWN = 0.85;
export const MAG_SIZE = 7;
export const MAX_HEALTH = 100;
export const RELOAD_MS = 700;
export const FIRE_RATE_MS = 340;

export function randomEnemyPosition(
  playerX = 0,
  playerZ = 6,
): [number, number, number] {
  const limit = ROOM_HALF - 1.6;
  for (let i = 0; i < 24; i++) {
    const x = (Math.random() * 2 - 1) * limit;
    const z = (Math.random() * 2 - 1) * limit;
    const dx = x - playerX;
    const dz = z - playerZ;
    if (dx * dx + dz * dz >= ENEMY_MIN_DISTANCE * ENEMY_MIN_DISTANCE) {
      return [x, 0, z];
    }
  }
  return [0, 0, -6];
}

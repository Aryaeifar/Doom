"use client";

export function Hud({
  locked,
  kills,
  flash,
  health,
  ammo,
  magSize,
  reloading,
  dead,
}: {
  locked: boolean;
  kills: number;
  flash: boolean;
  health: number;
  ammo: number;
  magSize: number;
  reloading: boolean;
  dead: boolean;
}) {
  const empty = ammo <= 0;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 font-mono">
      {!locked && !dead && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <p className="text-center text-lg tracking-wide text-zinc-200">
            Press Space to play
            <br />
            <span className="text-sm text-zinc-400">
              WASD move · mouse look · left click shoot · right click reload
            </span>
          </p>
        </div>
      )}
      {dead && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-red-950/80">
          <p className="text-center text-2xl tracking-widest text-red-200">
            YOU DIED
            <br />
            <span className="text-sm text-red-300/80">Press Space to restart</span>
          </p>
        </div>
      )}
      {locked && !dead && (
        <>
          <div className="absolute left-1/2 top-1/2 h-4 w-px -translate-x-1/2 -translate-y-1/2 bg-red-500" />
          <div className="absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 -translate-y-1/2 bg-red-500" />
        </>
      )}
      {flash && (
        <div className="absolute bottom-[22%] left-1/2 h-10 w-20 -translate-x-1/2 bg-orange-200/35" />
      )}
      {locked && empty && !reloading && !dead && (
        <p className="absolute left-1/2 top-[58%] -translate-x-1/2 text-sm tracking-widest text-yellow-300">
          RIGHT CLICK TO RELOAD
        </p>
      )}
      {reloading && !dead && (
        <p className="absolute left-1/2 top-[58%] -translate-x-1/2 text-sm tracking-widest text-zinc-300">
          RELOADING
        </p>
      )}
      <p className="absolute left-4 top-4 text-sm text-zinc-300">Kills: {kills}</p>
      <div className="absolute bottom-6 left-8 right-8 flex items-end justify-between text-yellow-500">
        <div>
          <p className="text-xs tracking-[0.3em] text-yellow-600">HEALTH</p>
          <p className="text-5xl font-bold leading-none">{Math.max(0, health)}</p>
          <div className="mt-2 h-2 w-40 bg-zinc-800">
            <div
              className="h-full bg-red-600"
              style={{ width: `${Math.max(0, health)}%` }}
            />
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs tracking-[0.3em] text-yellow-600">AMMO</p>
          <p className="text-5xl font-bold leading-none">
            {ammo}
            <span className="text-2xl text-yellow-700">/{magSize}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

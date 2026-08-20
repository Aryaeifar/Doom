"use client";

let audioCtx: AudioContext | null = null;
const buffers = new Map<string, AudioBuffer>();
let loading: Promise<void> | null = null;

const MONSTER_FILES = [
  "dsbgsit1",
  "dsbgact",
  "dsclaw",
  "dsbgdth1",
  "dssgtsit",
  "dssgtatk",
  "dssgtdth",
  "dscacsit",
  "dscacdth",
  "dsfirsht",
  "dsposit1",
  "dsposact",
  "dspodth1",
  "dspopain",
] as const;

const MONSTER_SFX = [
  { sit: "dsbgsit1", act: "dsbgact", atk: "dsclaw", dth: "dsbgdth1" },
  { sit: "dssgtsit", act: "dssgtsit", atk: "dssgtatk", dth: "dssgtdth" },
  { sit: "dscacsit", act: "dscacsit", atk: "dsfirsht", dth: "dscacdth" },
  { sit: "dsposit1", act: "dsposact", atk: "dspopain", dth: "dspodth1" },
] as const;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
  }
  return audioCtx;
}

function playNoise(
  duration: number,
  startGain: number,
  startFreq: number,
  endFreq: number,
) {
  const ctx = getAudioContext();
  if (!ctx) return;
  void ctx.resume();

  const sampleCount = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < sampleCount; i++) {
    const t = i / sampleCount;
    data[i] = (Math.random() * 2 - 1) * (1 - t) * (1 - t);
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(startFreq, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(
    endFreq,
    ctx.currentTime + duration,
  );

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(startGain, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start();
}

function playBuffer(buffer: AudioBuffer, volume: number) {
  const ctx = getAudioContext();
  if (!ctx) return;
  void ctx.resume();
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.value = volume;
  source.connect(gain);
  gain.connect(ctx.destination);
  source.start();
}

function playFile(file: string, volume = 0.9) {
  const buffer = buffers.get(file);
  if (buffer) {
    playBuffer(buffer, volume);
    return;
  }
  void preloadMonsterSounds().then(() => {
    const loaded = buffers.get(file);
    if (loaded) playBuffer(loaded, volume);
  });
}

function sfx(kind: number) {
  return MONSTER_SFX[kind % MONSTER_SFX.length];
}

export async function preloadMonsterSounds() {
  const ctx = getAudioContext();
  if (!ctx) return;
  await ctx.resume();
  if (!loading) {
    loading = Promise.all(
      MONSTER_FILES.map(async (file) => {
        if (buffers.has(file)) return;
        const res = await fetch(`/sounds/${file}.wav`);
        const raw = await res.arrayBuffer();
        const decoded = await ctx.decodeAudioData(raw.slice(0));
        buffers.set(file, decoded);
      }),
    ).then(() => undefined);
  }
  await loading;
}

export function playShootSound() {
  playNoise(0.12, 0.45, 1800, 200);
}

export function playEmptySound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  void ctx.resume();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(140, ctx.currentTime);
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.07);
}

export function playReloadSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  void ctx.resume();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(220, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.18);
  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.24);
}

export function playEnemyAlert(kind = 0) {
  playFile(sfx(kind).sit, 0.95);
}

export function playEnemyGrowl(kind = 0) {
  playFile(sfx(kind).act, 0.7);
}

export function playEnemyAttack(kind = 0) {
  playFile(sfx(kind).atk, 0.95);
}

export function playEnemyDeath(kind = 0) {
  playFile(sfx(kind).dth, 1);
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

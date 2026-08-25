// ============================================
// IMPOSTOR GAME — Web Audio Synthesized Sounds
// ============================================

let audioCtx: AudioContext | null = null;
let enabled = true;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

export function setSoundsEnabled(val: boolean): void {
  enabled = val;
}

export function isSoundsEnabled(): boolean {
  return enabled;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15): void {
  if (!enabled) return;
  try {
    const ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch { /* ignore */ }
}

export function playJoinSound(): void {
  playTone(523, 0.15, 'sine', 0.1);
  setTimeout(() => playTone(659, 0.15, 'sine', 0.1), 100);
}

export function playVoteRequestSound(): void {
  playTone(440, 0.2, 'triangle', 0.12);
  setTimeout(() => playTone(550, 0.2, 'triangle', 0.12), 150);
}

export function playVoteSound(): void {
  playTone(600, 0.1, 'sine', 0.08);
}

export function playSuspenseSound(): void {
  const ctx = getCtx();
  if (ctx.state === 'suspended') ctx.resume();
  if (!enabled) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + 2.5);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 2);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 3);
  } catch { /* ignore */ }
}

export function playWinSound(): void {
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.3, 'sine', 0.12), i * 120);
  });
}

export function playLoseSound(): void {
  playTone(400, 0.3, 'sawtooth', 0.08);
  setTimeout(() => playTone(300, 0.4, 'sawtooth', 0.06), 200);
}

export function playStartSound(): void {
  const notes = [392, 494, 587, 784];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.2, 'triangle', 0.1), i * 80);
  });
}

export function playVotingStartedSound(): void {
  playTone(880, 0.15, 'square', 0.06);
  setTimeout(() => playTone(880, 0.15, 'square', 0.06), 200);
  setTimeout(() => playTone(1100, 0.25, 'square', 0.06), 400);
}

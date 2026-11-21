// Synthesised sounds, no audio files: every effect is a few WebAudio oscillators.
// The context is created on the first user gesture; until then everything is a
// no-op, so a headless screenshot run stays silent and never throws.
let ctx = null;
let muted = false;

export function setMuted(value) { muted = value; }
export function isMuted() { return muted; }

function audio() {
  if (muted) return null;
  try {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq, at, dur, type, vol) {
  const ac = audio();
  if (!ac) return;
  try {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type; osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, ac.currentTime + at);
    gain.gain.exponentialRampToValueAtTime(vol, ac.currentTime + at + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + at + dur);
    osc.connect(gain); gain.connect(ac.destination);
    osc.start(ac.currentTime + at); osc.stop(ac.currentTime + at + dur + 0.05);
  } catch { /* sound is decoration, never a crash */ }
}

/** A bright two-note pop when a difference is found. */
export function playFound(combo) {
  const lift = Math.min(combo, 6) * 30;
  tone(660 + lift, 0, 0.12, 'sine', 0.22);
  tone(880 + lift, 0.07, 0.18, 'sine', 0.22);
  tone(1320 + lift, 0.07, 0.1, 'triangle', 0.08);
}

/** A low buzz when a click misses. */
export function playMiss() {
  tone(160, 0, 0.18, 'sawtooth', 0.12);
  tone(110, 0.05, 0.2, 'sawtooth', 0.1);
}

/** A soft shimmer when a hint fires. */
export function playHint() {
  tone(1180, 0, 0.15, 'sine', 0.12);
  tone(1560, 0.1, 0.2, 'sine', 0.1);
}

/** A short tick when the clock is nearly out. */
export function playTick() { tone(980, 0, 0.06, 'square', 0.06); }

/** An arpeggio when a level is cleared. */
export function playLevelClear() {
  [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.22, 'triangle', 0.18));
}

/** A longer fanfare for the final victory. */
export function playVictory() {
  [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.11, 0.28, 'triangle', 0.18));
}

/** A sad two-note fall when time runs out. */
export function playTimeUp() {
  tone(392, 0, 0.25, 'triangle', 0.16);
  tone(262, 0.22, 0.4, 'triangle', 0.16);
}

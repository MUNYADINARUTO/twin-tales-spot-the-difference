// The game itself: state, rules and the frame loop. Scenes are drawn from
// scenes.js, the frame from render.js, sounds from audio.js, input from input.js.
// A click on either picture is tested against the level's unfound differences;
// a hit marks it on both panels, a miss costs time and breaks the combo.
import { FIELD, STEP, GAME, LEVELS, BEST_KEY, PANEL_LEFT, PANEL_RIGHT } from './config.js';
import { getScene } from './scenes.js';
import { drawFrame } from './render.js';
import { attachInput, setButtons } from './input.js';
import { stageShot } from './shots.js';
import * as sfx from './audio.js';

const canvas = document.getElementById('game');
const statusEl = document.getElementById('status');
const ctx = canvas.getContext('2d');

const state = {
  screen: 'title',
  levelIndex: 0,
  scene: LEVELS[0].scene,
  found: new Set(),
  combo: 0,
  score: 0,
  best: 0,
  timeLeft: LEVELS[0].seconds,
  hintsLeft: GAME.hintsPerLevel,
  hintsUsed: 0,
  muted: false,
  hint: null,
  floats: [],
  misses: [],
  toast: null,
  levelFound: 0,
  levelBonus: 0,
  timeBonus: 0,
  accuracy: 100,
  clicks: 0,
  hits: 0,
  pausedFrom: null,
  frozen: false,
};

try { state.best = Number(localStorage.getItem(BEST_KEY) ?? 0) || 0; } catch { state.best = 0; }

function saveBest() {
  try { localStorage.setItem(BEST_KEY, String(state.best)); } catch { /* best score is a nicety */ }
}

function announce(msg) { if (statusEl) statusEl.textContent = msg; }

/** Put the state at the start of a level: fresh finds, full clock, fresh hints. */
function startLevel(index) {
  state.levelIndex = index;
  state.scene = LEVELS[index].scene;
  state.found = new Set();
  state.combo = 0;
  state.timeLeft = LEVELS[index].seconds;
  state.hintsLeft = GAME.hintsPerLevel;
  state.hint = null;
  state.floats = [];
  state.misses = [];
  state.toast = null;
  state.screen = 'intro';
  announce(`Level ${index + 1}: ${LEVELS[index].name}. ${getScene(state.scene).diffs.length} differences to find.`);
}

function startGame() {
  state.score = 0;
  state.clicks = 0;
  state.hits = 0;
  state.hintsUsed = 0;
  startLevel(0);
}

function levelClear() {
  // The time and level bonus were already added by findDifference.
  const scene = getScene(state.scene);
  state.screen = 'levelDone';
  sfx.playLevelClear();
  announce(`Level clear! ${scene.diffs.length} differences found. Time bonus ${state.timeBonus}.`);
}

function gameOver() {
  state.screen = 'gameOver';
  sfx.playTimeUp();
  announce(`Time's up. You found ${state.found.size} differences.`);
}

function victory() {
  state.screen = 'victory';
  state.accuracy = state.clicks === 0 ? 100 : Math.round((state.hits / state.clicks) * 100);
  if (state.score > state.best) { state.best = state.score; saveBest(); }
  sfx.playVictory();
  announce(`You found them all! Final score ${state.score}.`);
}

/** The same find a click makes, callable by the screenshot stager: mark one diff. */
export function findDifference(diff) {
  if (state.found.has(diff.id)) return false;
  state.found.add(diff.id);
  state.hits += 1;
  state.combo += 1;
  const points = GAME.findPoints + GAME.comboStep * (state.combo - 1);
  state.score += points;
  const now = performance.now();
  state.floats.push({ x: PANEL_LEFT.x + diff.x, y: PANEL_LEFT.y + diff.y - diff.r - 8, text: `+${points}`, color: '#7ee0a3', until: now + 1200 });
  state.toast = { text: `Found: ${diff.label}!  +${points}`, until: now + 1800 };
  sfx.playFound(state.combo);
  announce(`Found ${diff.label}. ${state.found.size} of ${getScene(state.scene).diffs.length}.`);
  if (state.found.size === getScene(state.scene).diffs.length) {
    // The last level pays its time and level bonus too, before the victory.
    state.levelFound = state.found.size;
    state.timeBonus = Math.round(state.timeLeft) * GAME.timeBonusPerSecond;
    state.levelBonus = GAME.levelBonus;
    state.score += state.timeBonus + state.levelBonus;
    if (state.levelIndex + 1 >= LEVELS.length) victory();
    else levelClear();
  }
  return true;
}

function missAt(x, y) {
  state.combo = 0;
  state.timeLeft = Math.max(0, state.timeLeft - GAME.missPenaltySeconds);
  state.misses.push({ x, y, until: performance.now() + 700 });
  state.toast = { text: `Not there — ${GAME.missPenaltySeconds} seconds lost`, until: performance.now() + 1400 };
  sfx.playMiss();
  announce('No difference there. Three seconds lost.');
}

function useHint() {
  if (state.screen !== 'play') return;
  if (state.hintsLeft <= 0) {
    state.toast = { text: 'No hints left this level', until: performance.now() + 1400 };
    return;
  }
  const scene = getScene(state.scene);
  const remaining = scene.diffs.filter((d) => !state.found.has(d.id));
  if (remaining.length === 0) return;
  const diff = remaining[Math.floor(Math.random() * remaining.length)];
  state.hintsLeft -= 1;
  state.hintsUsed += 1;
  state.score = Math.max(0, state.score - GAME.hintCost);
  state.hint = { id: diff.id, until: performance.now() + GAME.hintSeconds * 1000 };
  state.toast = { text: `Hint: look near the ${diff.label.replace(/^a |^an |^the /, '')} (−${GAME.hintCost})`, until: performance.now() + 1800 };
  sfx.playHint();
  announce('Hint used. Watch for the pulsing ring.');
}

/** A click on a picture: which panel, and is a difference under the point? */
function onPanelClick(p) {
  if (state.screen !== 'play') {
    if (state.screen === 'title' || state.screen === 'intro' || state.screen === 'levelDone') confirm();
    return;
  }
  state.clicks += 1;
  const scene = getScene(state.scene);
  let panel = null;
  if (p.x >= PANEL_LEFT.x && p.x <= PANEL_LEFT.x + PANEL_LEFT.width && p.y >= PANEL_LEFT.y && p.y <= PANEL_LEFT.y + PANEL_LEFT.height) panel = PANEL_LEFT;
  else if (p.x >= PANEL_RIGHT.x && p.x <= PANEL_RIGHT.x + PANEL_RIGHT.width && p.y >= PANEL_RIGHT.y && p.y <= PANEL_RIGHT.y + PANEL_RIGHT.height) panel = PANEL_RIGHT;
  if (!panel) return;
  const sx = p.x - panel.x;
  const sy = p.y - panel.y;
  let bestDiff = null;
  let bestDist = Infinity;
  for (const diff of scene.diffs) {
    if (state.found.has(diff.id)) continue;
    const dist = Math.hypot(sx - diff.x, sy - diff.y);
    if (dist < diff.r + 10 && dist < bestDist) { bestDiff = diff; bestDist = dist; }
  }
  if (bestDiff) findDifference(bestDiff);
  else missAt(p.x, p.y);
}

function onButton(id) {
  if (id === 'hint') useHint();
  else if (id === 'sound') {
    state.muted = !state.muted;
    sfx.setMuted(state.muted);
  } else if (id === 'pause') {
    if (state.screen === 'play') { state.pausedFrom = 'play'; state.screen = 'paused'; }
    else if (state.screen === 'paused') state.screen = state.pausedFrom ?? 'play';
  }
}

/** Enter / click-to-continue, by screen. */
function confirm() {
  if (state.screen === 'title') startGame();
  else if (state.screen === 'intro') { state.screen = 'play'; announce('Find the differences!'); }
  else if (state.screen === 'levelDone') startLevel(state.levelIndex + 1);
  else if (state.screen === 'gameOver') { state.screen = 'title'; }
  else if (state.screen === 'victory') startGame();
  else if (state.screen === 'paused') state.screen = state.pausedFrom ?? 'play';
}

function onKey(action) {
  if (action === 'confirm') confirm();
  else if (action === 'hint') useHint();
  else if (action === 'mute') {
    state.muted = !state.muted;
    sfx.setMuted(state.muted);
  } else if (action === 'pause') {
    if (state.screen === 'play') { state.pausedFrom = 'play'; state.screen = 'paused'; }
    else if (state.screen === 'paused') state.screen = state.pausedFrom ?? 'play';
  } else if (action === 'restart') {
    if (state.screen === 'play' || state.screen === 'gameOver' || state.screen === 'paused') startLevel(state.levelIndex);
  }
}

setButtons([
  { id: 'hint', x: 880, y: 545, w: 150, h: 42 },
  { id: 'sound', x: 1040, y: 545, w: 90, h: 42 },
  { id: 'pause', x: 1140, y: 545, w: 100, h: 42 },
]);
attachInput(canvas, { onPanelClick, onButton, onKey });

// --- frame loop -------------------------------------------------------------
function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(canvas.clientWidth * dpr);
  canvas.height = Math.round(canvas.clientHeight * dpr);
}
window.addEventListener('resize', resize);
resize();

let last = performance.now();
let acc = 0;
let tickedSecond = -1;

function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.25);
  last = now;
  if (!state.frozen && state.screen === 'play') {
    acc += dt;
    while (acc >= STEP) {
      acc -= STEP;
      state.timeLeft -= STEP;
      const whole = Math.ceil(state.timeLeft);
      if (state.timeLeft <= 10 && whole !== tickedSecond && state.timeLeft > 0) {
        tickedSecond = whole;
        sfx.playTick();
      }
      if (state.timeLeft <= 0) { state.timeLeft = 0; gameOver(); break; }
    }
  }
  state.floats = state.floats.filter((f) => now < f.until);
  state.misses = state.misses.filter((m) => now < m.until);
  const scale = Math.min(canvas.width / FIELD.width, canvas.height / FIELD.height);
  const ox = (canvas.width - FIELD.width * scale) / 2;
  const oy = (canvas.height - FIELD.height * scale) / 2;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#14101f';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(scale, 0, 0, scale, ox, oy);
  drawFrame(ctx, state, now);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// --- screenshot staging ------------------------------------------------------
// ?shot=start|cover|play|win stages a real frame through the game's own rules,
// so a screenshot is the game itself, never a mock-up. The clock is frozen.
const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot) {
  state.frozen = true;
  stageShot(shot, state, { findDifference, startLevel, startGame });
  // One extra frame's worth of state cleanup, then the loop draws the staged frame.
  document.title = `Twin Tales — shot ${shot}`;
}

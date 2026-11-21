// Everything on screen: the header, the two picture panels with their markers, the
// timer and counters, the buttons, and the title / intro / level-clear / time-up /
// victory / paused overlays. Pure drawing: it reads the game state and the clock,
// and never changes the state.
import { FIELD, PANEL_LEFT, PANEL_RIGHT, PALETTE, FONT, LEVELS } from './config.js';
import { getScene } from './scenes.js';
import { mouse } from './input.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, align = 'left', weight = 600) {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** Draw one scene panel: the picture, its border, and the markers for found diffs. */
function drawPanel(ctx, state, panel, side, now) {
  const scene = getScene(state.scene);
  ctx.save();
  rr(ctx, panel.x, panel.y, panel.width, panel.height, 10);
  ctx.clip();
  ctx.translate(panel.x, panel.y);
  const variant = new Set(side === 'right' ? scene.diffs.map((d) => d.id) : []);
  scene.draw(ctx, (id) => variant.has(id));
  // Found markers on both panels.
  for (const diff of scene.diffs) {
    if (!state.found.has(diff.id)) continue;
    ctx.strokeStyle = PALETTE.found;
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(diff.x, diff.y, diff.r + 7, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(126, 224, 163, 0.18)';
    ctx.beginPath(); ctx.arc(diff.x, diff.y, diff.r + 7, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = PALETTE.found; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(diff.x - 8, diff.y); ctx.lineTo(diff.x - 2, diff.y + 6); ctx.lineTo(diff.x + 9, diff.y - 7);
    ctx.stroke();
  }
  // The hint's pulse, on both panels.
  if (state.hint && now < state.hint.until) {
    const diff = scene.diffs.find((d) => d.id === state.hint.id);
    if (diff) {
      const pulse = 1 + 0.18 * Math.sin(now / 130);
      ctx.strokeStyle = PALETTE.hint;
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(diff.x, diff.y, (diff.r + 9) * pulse, 0, Math.PI * 2); ctx.stroke();
    }
  }
  ctx.restore();
  ctx.strokeStyle = PALETTE.panelBorder;
  ctx.lineWidth = 3;
  rr(ctx, panel.x, panel.y, panel.width, panel.height, 10);
  ctx.stroke();
}

function drawButton(ctx, b, label, sub) {
  const hover = mouse.inside && mouse.x >= b.x && mouse.x <= b.x + b.w && mouse.y >= b.y && mouse.y <= b.y + b.h;
  ctx.fillStyle = hover ? PALETTE.buttonHover : PALETTE.button;
  rr(ctx, b.x, b.y, b.w, b.h, 9); ctx.fill();
  ctx.strokeStyle = PALETTE.panelBorder; ctx.lineWidth = 1.5;
  rr(ctx, b.x, b.y, b.w, b.h, 9); ctx.stroke();
  text(ctx, label, b.x + b.w / 2, b.y + (sub ? b.h / 2 - 8 : b.h / 2), 16, PALETTE.text, 'center');
  if (sub) text(ctx, sub, b.x + b.w / 2, b.y + b.h / 2 + 11, 12, PALETTE.muted, 'center');
}

function drawHeader(ctx, state) {
  text(ctx, 'Twin Tales', 40, 36, 30, PALETTE.text, 'left', 800);
  text(ctx, 'SPOT THE DIFFERENCE', 40, 62, 13, PALETTE.accent, 'left', 700);
  const level = LEVELS[state.levelIndex];
  text(ctx, `Level ${state.levelIndex + 1} of ${LEVELS.length} · ${level.name}`, 640, 30, 19, PALETTE.text, 'center');
  text(ctx, level.blurb, 640, 56, 13, PALETTE.muted, 'center');
  text(ctx, `Score ${state.score.toLocaleString('en-US')}`, 1240, 30, 19, PALETTE.text, 'right');
  text(ctx, `Best ${Math.max(state.best, state.score).toLocaleString('en-US')}`, 1240, 56, 13, PALETTE.muted, 'right');
}

function drawHud(ctx, state, now) {
  const scene = getScene(state.scene);
  // Timer bar.
  const level = LEVELS[state.levelIndex];
  const frac = Math.max(0, state.timeLeft / level.seconds);
  const low = state.timeLeft <= 10 && state.screen === 'play';
  ctx.fillStyle = '#241d3a';
  rr(ctx, 40, 524, 1200, 12, 6); ctx.fill();
  ctx.fillStyle = low && Math.floor(now / 250) % 2 === 0 ? PALETTE.timerLow : (frac < 0.25 ? PALETTE.timerLow : PALETTE.timer);
  if (frac > 0) { rr(ctx, 40, 524, 1200 * frac, 12, 6); ctx.fill(); }
  text(ctx, `Time ${formatTime(state.timeLeft)}`, 1240, 516, 15, low ? PALETTE.danger : PALETTE.muted, 'right');
  // Found counter with dots.
  text(ctx, `Found ${state.found.size} / ${scene.diffs.length}`, 40, 566, 20, PALETTE.text, 'left', 700);
  scene.diffs.forEach((d, i) => {
    ctx.fillStyle = state.found.has(d.id) ? PALETTE.found : '#3a2f5e';
    ctx.beginPath(); ctx.arc(200 + i * 22, 566, 7, 0, Math.PI * 2); ctx.fill();
  });
  // Combo.
  if (state.combo >= 2) {
    text(ctx, `Combo ×${state.combo}`, 640, 566, 20, PALETTE.accent, 'center', 800);
  }
  // Buttons.
  drawButton(ctx, { x: 880, y: 545, w: 150, h: 42 }, 'Hint', `${state.hintsLeft} left · H`);
  drawButton(ctx, { x: 1040, y: 545, w: 90, h: 42 }, state.muted ? 'Muted' : 'Sound', 'M');
  drawButton(ctx, { x: 1140, y: 545, w: 100, h: 42 }, state.screen === 'paused' ? 'Resume' : 'Pause', 'P');
  // Footer help.
  text(ctx, 'Click a difference on either picture · H hint · M sound · P pause · R restart level', 640, 668, 14, PALETTE.muted, 'center', 500);
  // Floating score texts.
  for (const f of state.floats) {
    const age = 1 - (f.until - now) / 1200;
    if (age < 0 || age > 1) continue;
    ctx.globalAlpha = 1 - age;
    text(ctx, f.text, f.x, f.y - age * 26, 20, f.color, 'center', 800);
    ctx.globalAlpha = 1;
  }
  // Miss marks.
  for (const m of state.misses) {
    const age = 1 - (m.until - now) / 700;
    if (age < 0 || age > 1) continue;
    ctx.globalAlpha = 1 - age;
    ctx.strokeStyle = PALETTE.danger; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(m.x - 10, m.y - 10); ctx.lineTo(m.x + 10, m.y + 10);
    ctx.moveTo(m.x + 10, m.y - 10); ctx.lineTo(m.x - 10, m.y + 10);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  // Toast.
  if (state.toast && now < state.toast.until) {
    text(ctx, state.toast.text, 640, 620, 17, PALETTE.accent2, 'center', 700);
  }
}

function dim(ctx) { ctx.fillStyle = 'rgba(12, 8, 24, 0.72)'; ctx.fillRect(0, 0, FIELD.width, FIELD.height); }

function card(ctx, x, y, w, h) {
  ctx.fillStyle = '#1d1830';
  rr(ctx, x, y, w, h, 16); ctx.fill();
  ctx.strokeStyle = PALETTE.panelBorder; ctx.lineWidth = 2;
  rr(ctx, x, y, w, h, 16); ctx.stroke();
}

function drawTitle(ctx, state) {
  const scene = getScene('meadow');
  // Two little teaser panels, one difference ringed.
  for (const [px, side] of [[330, 'left'], [660, 'right']]) {
    ctx.save();
    rr(ctx, px, 210, 290, 207, 10);
    ctx.clip();
    ctx.translate(px, 210);
    ctx.scale(290 / 560, 207 / 400);
    const variant = new Set(side === 'right' ? scene.diffs.map((d) => d.id) : []);
    scene.draw(ctx, (id) => variant.has(id));
    ctx.restore();
    ctx.strokeStyle = PALETTE.panelBorder; ctx.lineWidth = 2;
    rr(ctx, px, 210, 290, 207, 10); ctx.stroke();
  }
  // Ring the butterfly on the right teaser.
  ctx.strokeStyle = PALETTE.accent; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(660 + (300 * 290) / 560, 210 + (150 * 207) / 400, 16, 0, Math.PI * 2); ctx.stroke();
  text(ctx, 'Twin Tales', 640, 92, 64, PALETTE.text, 'center', 800);
  text(ctx, 'S P O T   T H E   D I F F E R E N C E', 640, 148, 20, PALETTE.accent, 'center', 700);
  text(ctx, 'Two pictures. A handful of tiny lies between them. Find them all before the clock runs out.', 640, 182, 16, PALETTE.muted, 'center', 500);
  text(ctx, '5 scenes · 42 differences · hints, combos and a ticking clock', 640, 448, 16, PALETTE.text, 'center', 600);
  text(ctx, 'Click a difference on either picture — a wrong click costs 3 seconds.', 640, 478, 15, PALETTE.muted, 'center', 500);
  text(ctx, 'Press Enter or click anywhere to play', 640, 528, 20, PALETTE.accent2, 'center', 700);
  if (state.best > 0) text(ctx, `Best score: ${state.best.toLocaleString('en-US')}`, 640, 566, 16, PALETTE.muted, 'center');
  text(ctx, 'H hint · M sound · P pause', 640, 668, 14, PALETTE.muted, 'center', 500);
}

function drawIntro(ctx, state) {
  dim(ctx);
  const level = LEVELS[state.levelIndex];
  const scene = getScene(state.scene);
  card(ctx, 390, 220, 500, 280);
  text(ctx, `Level ${state.levelIndex + 1} of ${LEVELS.length}`, 640, 262, 16, PALETTE.accent, 'center', 700);
  text(ctx, level.name, 640, 306, 36, PALETTE.text, 'center', 800);
  text(ctx, level.blurb, 640, 352, 16, PALETTE.muted, 'center', 500);
  text(ctx, `${scene.diffs.length} differences · ${formatTime(level.seconds)} on the clock · 3 hints`, 640, 392, 16, PALETTE.text, 'center', 600);
  text(ctx, 'Click or press Enter to start', 640, 448, 18, PALETTE.accent2, 'center', 700);
}

function drawLevelDone(ctx, state) {
  dim(ctx);
  card(ctx, 390, 200, 500, 320);
  text(ctx, 'Level clear!', 640, 248, 36, PALETTE.accent2, 'center', 800);
  text(ctx, LEVELS[state.levelIndex].name, 640, 292, 18, PALETTE.text, 'center', 600);
  text(ctx, `All ${state.levelFound} differences found`, 640, 330, 16, PALETTE.muted, 'center', 500);
  text(ctx, `Time bonus  +${state.timeBonus.toLocaleString('en-US')}`, 640, 366, 17, PALETTE.text, 'center', 600);
  text(ctx, `Level bonus  +${state.levelBonus.toLocaleString('en-US')}`, 640, 394, 17, PALETTE.text, 'center', 600);
  text(ctx, `Score  ${state.score.toLocaleString('en-US')}`, 640, 432, 20, PALETTE.accent, 'center', 800);
  text(ctx, 'Click or press Enter for the next level', 640, 474, 17, PALETTE.accent2, 'center', 700);
}

function drawGameOver(ctx, state) {
  dim(ctx);
  const scene = getScene(state.scene);
  card(ctx, 390, 200, 500, 320);
  text(ctx, 'Time\u2019s up!', 640, 248, 36, PALETTE.danger, 'center', 800);
  text(ctx, LEVELS[state.levelIndex].name, 640, 292, 18, PALETTE.text, 'center', 600);
  text(ctx, `You found ${state.found.size} of ${scene.diffs.length} differences`, 640, 330, 16, PALETTE.muted, 'center', 500);
  text(ctx, `Score  ${state.score.toLocaleString('en-US')}`, 640, 372, 20, PALETTE.accent, 'center', 800);
  text(ctx, 'Press R to retry this level, or Enter for the title screen', 640, 420, 16, PALETTE.accent2, 'center', 700);
}

function drawVictory(ctx, state) {
  dim(ctx);
  card(ctx, 340, 150, 600, 420);
  text(ctx, 'You found them all!', 640, 208, 38, PALETTE.accent2, 'center', 800);
  text(ctx, 'All five scenes, all 42 differences.', 640, 254, 17, PALETTE.muted, 'center', 500);
  text(ctx, `Final score  ${state.score.toLocaleString('en-US')}`, 640, 306, 26, PALETTE.accent, 'center', 800);
  if (state.score >= state.best && state.best > 0) text(ctx, 'A new best score!', 640, 344, 18, PALETTE.accent2, 'center', 700);
  else text(ctx, `Best score  ${state.best.toLocaleString('en-US')}`, 640, 344, 17, PALETTE.muted, 'center');
  text(ctx, `Accuracy  ${state.accuracy}%  ·  Hints used  ${state.hintsUsed}`, 640, 384, 16, PALETTE.text, 'center', 600);
  text(ctx, 'Press Enter to play again', 640, 448, 18, PALETTE.accent2, 'center', 700);
  text(ctx, 'Thanks for playing Twin Tales.', 640, 508, 15, PALETTE.muted, 'center', 500);
}

function drawPaused(ctx) {
  dim(ctx);
  text(ctx, 'Paused', 640, 330, 44, PALETTE.text, 'center', 800);
  text(ctx, 'Press P or click Resume to carry on', 640, 384, 18, PALETTE.muted, 'center', 500);
}

export function drawFrame(ctx, state, now) {
  ctx.fillStyle = PALETTE.backdrop;
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  if (state.screen === 'title') { drawTitle(ctx, state); return; }
  drawHeader(ctx, state);
  drawPanel(ctx, state, PANEL_LEFT, 'left', now);
  drawPanel(ctx, state, PANEL_RIGHT, 'right', now);
  drawHud(ctx, state, now);
  if (state.screen === 'intro') drawIntro(ctx, state);
  else if (state.screen === 'levelDone') drawLevelDone(ctx, state);
  else if (state.screen === 'gameOver') drawGameOver(ctx, state);
  else if (state.screen === 'victory') drawVictory(ctx, state);
  else if (state.screen === 'paused') drawPaused(ctx);
}

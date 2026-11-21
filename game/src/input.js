// Pointer and keyboard input, translated into the game's 1280x720 logical space.
// The canvas always shows the whole field letterboxed, so a client point maps back
// through the same scale and offset the renderer uses. Buttons are registered by
// the game (id + logical rect); a click on one calls onButton, a click on a picture
// panel calls onPanelClick with the panel ('left' | 'right') and the scene point.
import { FIELD } from './config.js';

let buttons = [];
export const mouse = { x: -1, y: -1, inside: false };

export function setButtons(list) { buttons = list; }

function toLogical(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const scale = Math.min(rect.width / FIELD.width, rect.height / FIELD.height);
  const ox = (rect.width - FIELD.width * scale) / 2;
  const oy = (rect.height - FIELD.height * scale) / 2;
  return { x: (clientX - rect.left - ox) / scale, y: (clientY - rect.top - oy) / scale };
}

export function attachInput(canvas, handlers) {
  canvas.addEventListener('pointermove', (event) => {
    const p = toLogical(canvas, event.clientX, event.clientY);
    mouse.x = p.x; mouse.y = p.y;
    mouse.inside = p.x >= 0 && p.x <= FIELD.width && p.y >= 0 && p.y <= FIELD.height;
  });
  canvas.addEventListener('pointerleave', () => { mouse.inside = false; });
  canvas.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    const p = toLogical(canvas, event.clientX, event.clientY);
    for (const b of buttons) {
      if (p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h) {
        handlers.onButton(b.id);
        return;
      }
    }
    handlers.onPanelClick(p);
  });
  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key === 'enter' || key === ' ') { event.preventDefault(); handlers.onKey('confirm'); }
    else if (key === 'h') handlers.onKey('hint');
    else if (key === 'm') handlers.onKey('mute');
    else if (key === 'p' || key === 'escape') handlers.onKey('pause');
    else if (key === 'r') handlers.onKey('restart');
  });
}

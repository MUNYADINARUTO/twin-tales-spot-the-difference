// The five scenes. Every scene is drawn by hand in canvas code, in a fixed 560x400
// space, from one seeded generator so the two panels match exactly except for the
// differences. A difference is data: { id, x, y, r, label } plus how the scene's
// draw function treats it — 'add' (right panel only), 'remove' (left panel only)
// or 'change' (drawn differently on each side). `v(id)` is true on the right panel
// when that difference is in play.

// --- small canvas helpers -------------------------------------------------
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function circle(ctx, x, y, r, fill) { ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
function ellipse(ctx, x, y, rx, ry, fill) { ctx.fillStyle = fill; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); }
function rect(ctx, x, y, w, h, fill) { ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); }
function poly(ctx, pts, fill) {
  ctx.fillStyle = fill; ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i += 1) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath(); ctx.fill();
}
function line(ctx, x1, y1, x2, y2, color, w) {
  ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
}
function star(ctx, x, y, r, fill, points = 5) {
  ctx.fillStyle = fill; ctx.beginPath();
  for (let i = 0; i < points * 2; i += 1) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = (i * Math.PI) / points - Math.PI / 2;
    const px = x + Math.cos(a) * rad, py = y + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath(); ctx.fill();
}
function cloud(ctx, x, y, s) {
  ellipse(ctx, x, y, 34 * s, 16 * s, '#ffffff');
  ellipse(ctx, x - 22 * s, y + 6 * s, 22 * s, 12 * s, '#ffffff');
  ellipse(ctx, x + 24 * s, y + 6 * s, 24 * s, 12 * s, '#ffffff');
}
function bird(ctx, x, y, s, color) {
  ctx.strokeStyle = color; ctx.lineWidth = 2.5 * s; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(x - 7 * s, y, 7 * s, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
  ctx.beginPath(); ctx.arc(x + 7 * s, y, 7 * s, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
}
function flower(ctx, x, y, petal, center) {
  line(ctx, x, y, x, y + 18, '#2f7d3a', 3);
  for (let i = 0; i < 5; i += 1) {
    const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
    circle(ctx, x + Math.cos(a) * 8, y + Math.sin(a) * 8, 6, petal);
  }
  circle(ctx, x, y, 6, center);
}
function duck(ctx, x, y, s) {
  ellipse(ctx, x, y, 12 * s, 8 * s, '#ffd94d');
  circle(ctx, x + 10 * s, y - 6 * s, 6 * s, '#ffd94d');
  poly(ctx, [[x + 15 * s, y - 7 * s], [x + 21 * s, y - 4 * s], [x + 15 * s, y - 2 * s]], '#ff9f43');
  circle(ctx, x + 11 * s, y - 8 * s, 1.5, '#222');
}

// --- Scene 1: Sunny Meadow -----------------------------------------------
const meadowDiffs = [
  { id: 'flower-add', x: 250, y: 352, r: 18, label: 'an extra flower' },
  { id: 'cloud-gone', x: 420, y: 48, r: 26, label: 'a missing cloud' },
  { id: 'butterfly-blue', x: 300, y: 150, r: 22, label: 'the butterfly changed colour' },
  { id: 'bunny-ear', x: 488, y: 272, r: 14, label: 'the bunny\u2019s shorter ear' },
  { id: 'apple-gone', x: 108, y: 168, r: 10, label: 'a missing apple' },
  { id: 'duck-extra', x: 448, y: 336, r: 16, label: 'a third duck' },
  { id: 'fence-post', x: 260, y: 302, r: 14, label: 'a missing fence post' },
];
function drawMeadow(ctx, v) {
  const sky = ctx.createLinearGradient(0, 0, 0, 280);
  sky.addColorStop(0, '#6ec1f5'); sky.addColorStop(1, '#dff3ff');
  rect(ctx, 0, 0, 560, 400, sky);
  // Sun with a smile.
  circle(ctx, 70, 60, 32, '#ffd94d');
  for (let i = 0; i < 8; i += 1) {
    const a = (i * Math.PI) / 4;
    line(ctx, 70 + Math.cos(a) * 38, 60 + Math.sin(a) * 38, 70 + Math.cos(a) * 48, 60 + Math.sin(a) * 48, '#ffd94d', 4);
  }
  circle(ctx, 62, 56, 3, '#7a5b00'); circle(ctx, 78, 56, 3, '#7a5b00');
  ctx.strokeStyle = '#7a5b00'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(70, 62, 12, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke();
  cloud(ctx, 200, 55, 1);
  if (!v('cloud-gone')) cloud(ctx, 420, 48, 1.1);
  cloud(ctx, 330, 95, 0.7);
  bird(ctx, 480, 82, 1, '#3a4a5a');
  // Hills.
  ellipse(ctx, 120, 430, 260, 130, '#7ec850');
  ellipse(ctx, 470, 440, 280, 140, '#68b844');
  // Tree with apples.
  rect(ctx, 88, 190, 14, 95, '#8a5a2b');
  circle(ctx, 95, 170, 45, '#3f9e4d'); circle(ctx, 62, 195, 30, '#4caf5e'); circle(ctx, 128, 195, 30, '#4caf5e');
  circle(ctx, 75, 178, 6, '#e33'); circle(ctx, 95, 198, 6, '#e33');
  if (!v('apple-gone')) circle(ctx, 108, 168, 6, '#e33');
  // Pond with ducks.
  ellipse(ctx, 400, 335, 72, 22, '#4aa3df');
  ellipse(ctx, 400, 332, 72, 16, '#6fc0ef');
  duck(ctx, 375, 332, 1); duck(ctx, 420, 338, 0.9);
  if (v('duck-extra')) duck(ctx, 448, 336, 0.85);
  // Fence.
  rect(ctx, 180, 292, 160, 6, '#a9713f'); rect(ctx, 180, 308, 160, 6, '#a9713f');
  for (const px of [200, 260, 320]) {
    if (px === 260 && v('fence-post')) continue;
    rect(ctx, px - 4, 282, 8, 42, '#8a5a2b');
  }
  // Bunny.
  ellipse(ctx, 480, 306, 17, 12, '#ffffff');
  circle(ctx, 482, 288, 10, '#ffffff');
  ellipse(ctx, 476, 270, 4, 13, '#ffffff');
  ellipse(ctx, 488, v('bunny-ear') ? 278 : 270, 4, v('bunny-ear') ? 6 : 13, '#ffffff');
  circle(ctx, 485, 286, 1.6, '#222'); circle(ctx, 479, 286, 1.6, '#222');
  // Butterfly.
  const wing = v('butterfly-blue') ? '#5aa9ff' : '#ff8c42';
  ellipse(ctx, 288, 146, 12, 9, wing); ellipse(ctx, 312, 146, 12, 9, wing);
  ellipse(ctx, 290, 158, 9, 7, wing); ellipse(ctx, 310, 158, 9, 7, wing);
  line(ctx, 300, 142, 300, 162, '#333', 3);
  // Mushroom.
  rect(ctx, 156, 336, 8, 14, '#fff3d6');
  ctx.fillStyle = '#e33'; ctx.beginPath(); ctx.arc(160, 336, 14, Math.PI, 0); ctx.fill();
  circle(ctx, 155, 330, 2.5, '#fff'); circle(ctx, 165, 332, 2.5, '#fff');
  // Flowers along the bottom.
  const petals = ['#ff6b9d', '#c084fc', '#ff9f43', '#ff6b9d', '#ffd94d', '#c084fc'];
  [60, 140, 220, 300, 460, 520].forEach((x, i) => flower(ctx, x, 362, petals[i], '#fff3b0'));
  if (v('flower-add')) flower(ctx, 250, 352, '#ff6b9d', '#fff3b0');
}

// --- Scene 2: Harbor at Dusk ----------------------------------------------
const harborDiffs = [
  { id: 'beam', x: 112, y: 132, r: 30, label: 'the lighthouse beam' },
  { id: 'sail', x: 250, y: 215, r: 26, label: 'the sail changed colour' },
  { id: 'gull-extra', x: 380, y: 90, r: 14, label: 'an extra seagull' },
  { id: 'crate-gone', x: 495, y: 315, r: 16, label: 'a missing crate' },
  { id: 'buoy-gone', x: 350, y: 300, r: 14, label: 'a missing buoy' },
  { id: 'star-extra', x: 300, y: 60, r: 10, label: 'an extra star' },
  { id: 'anchor-gone', x: 525, y: 330, r: 18, label: 'a missing anchor' },
  { id: 'window-lit', x: 60, y: 170, r: 12, label: 'the lighthouse window' },
];
function drawHarbor(ctx, v) {
  const sky = ctx.createLinearGradient(0, 0, 0, 250);
  sky.addColorStop(0, '#3d2b63'); sky.addColorStop(0.6, '#c65d7b'); sky.addColorStop(1, '#ff9a5c');
  rect(ctx, 0, 0, 560, 400, sky);
  // Stars appearing.
  const rnd = mulberry32(7);
  for (let i = 0; i < 14; i += 1) star(ctx, 20 + rnd() * 520, 12 + rnd() * 110, 2 + rnd() * 2, '#fff8d6');
  if (v('star-extra')) star(ctx, 300, 60, 4, '#fff8d6');
  // Setting sun.
  circle(ctx, 280, 250, 40, '#ffb347');
  ctx.fillStyle = '#ff9a5c'; ctx.fillRect(236, 250, 88, 10);
  // Sea.
  rect(ctx, 0, 250, 560, 150, '#1d3a5f');
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2;
  for (const [x, y, w] of [[90, 285, 60], [300, 305, 80], [430, 285, 50], [180, 330, 70], [380, 345, 90]]) {
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + w / 2, y - 6, x + w, y); ctx.stroke();
  }
  // Lighthouse.
  poly(ctx, [[46, 250], [74, 250], [70, 120], [50, 120]], '#f4ead8');
  rect(ctx, 48, 150, 24, 18, '#d94f4f'); rect(ctx, 47, 195, 26, 18, '#d94f4f');
  rect(ctx, 42, 100, 36, 22, '#33415c');
  rect(ctx, 56, 170, 8, 12, v('window-lit') ? '#ffd94d' : '#22304a');
  if (v('beam')) {
    ctx.fillStyle = 'rgba(255, 217, 77, 0.35)';
    ctx.beginPath(); ctx.moveTo(78, 108); ctx.lineTo(210, 84); ctx.lineTo(210, 138); ctx.closePath(); ctx.fill();
  }
  // Sailboat.
  line(ctx, 250, 190, 250, 258, '#5a3a22', 3);
  poly(ctx, [[252, 196], [252, 246], [288, 246]], v('sail') ? '#ffd94d' : '#d94f4f');
  poly(ctx, [[248, 200], [248, 246], [222, 246]], '#f4ead8');
  poly(ctx, [[218, 250], [292, 250], [280, 266], [230, 266]], '#6b4226');
  // Rowboat.
  ellipse(ctx, 430, 288, 26, 9, '#8a5a2b');
  line(ctx, 420, 282, 440, 282, '#5a3a22', 3);
  // Seagulls.
  bird(ctx, 180, 80, 1, '#fff'); bird(ctx, 320, 60, 0.9, '#fff'); bird(ctx, 450, 100, 1, '#fff');
  if (v('gull-extra')) bird(ctx, 380, 90, 0.9, '#fff');
  // Buoy.
  if (!v('buoy-gone')) {
    circle(ctx, 350, 300, 10, '#e33'); rect(ctx, 342, 296, 16, 6, '#fff');
    line(ctx, 350, 290, 350, 282, '#333', 2);
  }
  // Dock and crates.
  rect(ctx, 440, 340, 120, 60, '#7a5230');
  for (let i = 0; i < 4; i += 1) line(ctx, 440, 355 + i * 12, 560, 355 + i * 12, '#5a3a22', 2);
  rect(ctx, 458, 312, 26, 28, '#c98f5f'); rect(ctx, 458, 312, 26, 5, '#a9713f');
  if (!v('crate-gone')) { rect(ctx, 492, 318, 22, 22, '#c98f5f'); rect(ctx, 492, 318, 22, 4, '#a9713f'); }
  // Anchor leaning on the dock.
  if (!v('anchor-gone')) {
    ctx.strokeStyle = '#2b2b3a'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(525, 322, 5, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(525, 327); ctx.lineTo(525, 352); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(514, 334); ctx.lineTo(536, 334); ctx.stroke();
    ctx.beginPath(); ctx.arc(525, 348, 9, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke();
  }
}

// --- Scene 3: Cozy Kitchen --------------------------------------------------
const kitchenDiffs = [
  { id: 'clock-hands', x: 300, y: 80, r: 30, label: 'the clock hands moved' },
  { id: 'cat-tail', x: 505, y: 290, r: 16, label: 'the cat\u2019s tail' },
  { id: 'steam-gone', x: 150, y: 200, r: 18, label: 'the teapot steam' },
  { id: 'cup-extra', x: 335, y: 265, r: 14, label: 'a third cup' },
  { id: 'apple-green', x: 415, y: 250, r: 12, label: 'an apple changed colour' },
  { id: 'picture-moon', x: 500, y: 95, r: 24, label: 'the picture changed' },
  { id: 'spoon-gone', x: 340, y: 275, r: 12, label: 'a missing spoon' },
  { id: 'jar-gone', x: 450, y: 95, r: 14, label: 'a missing jar' },
];
function drawKitchen(ctx, v) {
  rect(ctx, 0, 0, 560, 400, '#f6e7c8');
  rect(ctx, 0, 320, 560, 80, '#c98f5f');
  for (let i = 0; i < 5; i += 1) line(ctx, 0, 340 + i * 12, 560, 340 + i * 12, '#a9713f', 1.5);
  // Window with curtains.
  rect(ctx, 60, 50, 150, 150, '#7ec8f7');
  circle(ctx, 105, 95, 22, '#ffd94d');
  cloud(ctx, 165, 80, 0.6);
  ellipse(ctx, 130, 185, 60, 12, '#7ec850');
  rect(ctx, 60, 50, 150, 150, 'rgba(0,0,0,0)');
  ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = 6; ctx.strokeRect(60, 50, 150, 150);
  line(ctx, 135, 50, 135, 200, '#8a5a2b', 5); line(ctx, 60, 125, 210, 125, '#8a5a2b', 5);
  poly(ctx, [[48, 40], [72, 40], [78, 210], [48, 210]], '#e76f88');
  poly(ctx, [[198, 40], [222, 40], [222, 210], [192, 210]], '#e76f88');
  // Wall clock.
  circle(ctx, 300, 80, 32, '#fff'); ctx.strokeStyle = '#333'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(300, 80, 32, 0, Math.PI * 2); ctx.stroke();
  if (v('clock-hands')) { line(ctx, 300, 80, 300, 56, '#333', 3); line(ctx, 300, 80, 318, 88, '#333', 3); }
  else { line(ctx, 300, 80, 322, 80, '#333', 3); line(ctx, 300, 80, 300, 58, '#333', 3); }
  circle(ctx, 300, 80, 3, '#333');
  // Shelf with jars.
  rect(ctx, 400, 112, 130, 8, '#8a5a2b');
  rect(ctx, 410, 82, 22, 30, '#bfe3ff'); rect(ctx, 410, 78, 22, 6, '#d94f4f');
  if (!v('jar-gone')) { rect(ctx, 440, 82, 22, 30, '#ffe1a8'); rect(ctx, 440, 78, 22, 6, '#3f9e4d'); }
  rect(ctx, 470, 82, 22, 30, '#e8c8ff'); rect(ctx, 470, 78, 22, 6, '#5aa9ff');
  // Picture frame: sun by day, moon by night.
  rect(ctx, 470, 60, 64, 52, '#8a5a2b');
  rect(ctx, 475, 65, 54, 42, '#2b3a67');
  if (v('picture-moon')) { circle(ctx, 502, 86, 12, '#f4ead8'); circle(ctx, 497, 83, 3, '#2b3a67'); circle(ctx, 506, 89, 2, '#2b3a67'); }
  else { circle(ctx, 502, 86, 12, '#ffd94d'); poly(ctx, [[480, 102], [496, 92], [512, 102], [524, 107], [480, 107]], '#3f9e4d'); }
  // Rug.
  ellipse(ctx, 280, 368, 130, 20, '#e76f88');
  ellipse(ctx, 280, 368, 95, 14, '#f6e7c8');
  ellipse(ctx, 280, 368, 55, 8, '#7ee0a3');
  // Table.
  rect(ctx, 40, 280, 480, 14, '#a9713f');
  rect(ctx, 60, 294, 12, 40, '#8a5a2b'); rect(ctx, 488, 294, 12, 40, '#8a5a2b');
  // Teapot with steam.
  ellipse(ctx, 150, 248, 30, 22, '#5aa9ff');
  poly(ctx, [[176, 238], [196, 228], [192, 244], [176, 248]], '#5aa9ff');
  ctx.strokeStyle = '#5aa9ff'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(122, 244, 12, Math.PI * 0.5, Math.PI * 1.5); ctx.stroke();
  rect(ctx, 144, 222, 12, 8, '#3f7fd1');
  if (!v('steam-gone')) {
    ctx.strokeStyle = 'rgba(120,120,120,0.7)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(145, 216); ctx.quadraticCurveTo(138, 204, 146, 194); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(158, 216); ctx.quadraticCurveTo(165, 204, 157, 192); ctx.stroke();
  }
  // Cups.
  for (const cx of [250, 300]) { rect(ctx, cx - 12, 258, 24, 18, '#fff'); line(ctx, cx + 12, 262, cx + 20, 266, '#ddd', 3); ellipse(ctx, cx, 260, 12, 4, '#c98f5f'); }
  if (v('cup-extra')) { rect(ctx, 323, 258, 24, 18, '#fff'); line(ctx, 347, 262, 355, 266, '#ddd', 3); ellipse(ctx, 335, 260, 12, 4, '#c98f5f'); }
  // Fruit bowl.
  poly(ctx, [[378, 262], [442, 262], [432, 280], [388, 280]], '#d94f4f');
  circle(ctx, 392, 254, 9, '#e33'); circle(ctx, 410, 250, 9, '#e33');
  circle(ctx, 428, 254, 9, v('apple-green') ? '#7ec850' : '#e33');
  // Spoon.
  if (!v('spoon-gone')) { line(ctx, 340, 268, 352, 282, '#cfd6de', 3); ellipse(ctx, 354, 284, 5, 7, '#cfd6de'); }
  // Chair with the cat.
  rect(ctx, 460, 300, 8, 40, '#8a5a2b'); rect(ctx, 520, 300, 8, 40, '#8a5a2b');
  rect(ctx, 456, 296, 76, 8, '#8a5a2b');
  ellipse(ctx, 494, 288, 24, 10, '#ff9f43');
  circle(ctx, 514, 278, 9, '#ff9f43');
  poly(ctx, [[508, 270], [511, 262], [515, 270]], '#ff9f43');
  poly(ctx, [[516, 270], [519, 262], [522, 270]], '#ff9f43');
  if (v('cat-tail')) { ctx.strokeStyle = '#ff9f43'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(472, 290); ctx.quadraticCurveTo(458, 288, 456, 274); ctx.stroke(); }
  else { ctx.strokeStyle = '#ff9f43'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(472, 292); ctx.quadraticCurveTo(460, 298, 452, 296); ctx.stroke(); }
}

// --- Scene 4: Enchanted Forest ----------------------------------------------
const forestDiffs = [
  { id: 'owl-eyes', x: 330, y: 170, r: 18, label: 'the owl closed its eyes' },
  { id: 'mushroom-extra', x: 360, y: 315, r: 16, label: 'an extra mushroom' },
  { id: 'firefly-extra', x: 250, y: 120, r: 10, label: 'an extra firefly' },
  { id: 'moon-crescent', x: 470, y: 60, r: 28, label: 'the moon changed phase' },
  { id: 'lantern-lit', x: 200, y: 150, r: 18, label: 'the lantern went dark' },
  { id: 'stone-gone', x: 250, y: 360, r: 14, label: 'a missing stone' },
  { id: 'flower-purple', x: 180, y: 375, r: 12, label: 'a flower changed colour' },
  { id: 'fish', x: 300, y: 365, r: 14, label: 'a fish in the stream' },
  { id: 'branch-gone', x: 520, y: 220, r: 16, label: 'a missing branch' },
];
function drawForest(ctx, v) {
  const sky = ctx.createLinearGradient(0, 0, 0, 400);
  sky.addColorStop(0, '#0d2b1d'); sky.addColorStop(1, '#123f2a');
  rect(ctx, 0, 0, 560, 400, sky);
  // Moon.
  circle(ctx, 470, 60, 28, '#f4ead8');
  if (v('moon-crescent')) circle(ctx, 480, 54, 24, '#0d2b1d');
  circle(ctx, 462, 54, 4, '#d8cdb2'); circle(ctx, 476, 68, 3, '#d8cdb2');
  // Big trees.
  for (const [tx, s] of [[80, 1.1], [200, 0.9], [420, 1.05]]) {
    rect(ctx, tx - 9 * s, 210, 18 * s, 110, '#5a3a22');
    poly(ctx, [[tx - 55 * s, 230], [tx + 55 * s, 230], [tx, 130]], '#1f6b38');
    poly(ctx, [[tx - 45 * s, 190], [tx + 45 * s, 190], [tx, 100]], '#27904a');
  }
  // Stream.
  poly(ctx, [[0, 340], [560, 330], [560, 400], [0, 400]], '#2b6cb0');
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 2;
  for (const [x, y, w] of [[60, 360, 50], [200, 372, 60], [420, 358, 55]]) {
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + w / 2, y - 5, x + w, y); ctx.stroke();
  }
  if (v('fish')) { ellipse(ctx, 300, 365, 12, 6, '#ff9f43'); poly(ctx, [[312, 365], [320, 359], [320, 371]], '#ff9f43'); circle(ctx, 292, 363, 1.5, '#222'); }
  // Stones.
  ellipse(ctx, 150, 345, 18, 10, '#8b93a3');
  if (!v('stone-gone')) ellipse(ctx, 250, 360, 16, 9, '#8b93a3');
  ellipse(ctx, 380, 350, 20, 11, '#8b93a3');
  // Mushrooms.
  for (const [mx, my, s] of [[120, 305, 1], [138, 312, 0.7]]) {
    rect(ctx, mx - 3 * s, my, 6 * s, 10 * s, '#fff3d6');
    ctx.fillStyle = '#e33'; ctx.beginPath(); ctx.arc(mx, my, 12 * s, Math.PI, 0); ctx.fill();
    circle(ctx, mx - 5 * s, my - 5 * s, 2, '#fff');
  }
  if (v('mushroom-extra')) {
    rect(ctx, 357, 312, 6, 10, '#fff3d6');
    ctx.fillStyle = '#e33'; ctx.beginPath(); ctx.arc(360, 312, 11, Math.PI, 0); ctx.fill();
  }
  // Fireflies.
  const rnd = mulberry32(21);
  for (let i = 0; i < 6; i += 1) {
    const fx = 60 + rnd() * 440, fy = 60 + rnd() * 160;
    circle(ctx, fx, fy, 5, 'rgba(255, 241, 120, 0.25)');
    circle(ctx, fx, fy, 2.5, '#fff178');
  }
  if (v('firefly-extra')) { circle(ctx, 250, 120, 5, 'rgba(255, 241, 120, 0.25)'); circle(ctx, 250, 120, 2.5, '#fff178'); }
  // Owl on a branch.
  line(ctx, 290, 200, 380, 200, '#5a3a22', 6);
  ellipse(ctx, 330, 176, 22, 26, '#8a6d4b');
  circle(ctx, 322, 166, 7, '#fff'); circle(ctx, 338, 166, 7, '#fff');
  if (v('owl-eyes')) { line(ctx, 316, 166, 328, 166, '#222', 2); line(ctx, 332, 166, 344, 166, '#222', 2); }
  else { circle(ctx, 322, 166, 3.5, '#222'); circle(ctx, 338, 166, 3.5, '#222'); }
  poly(ctx, [[330, 172], [326, 180], [334, 180]], '#ffb347');
  // Hanging lantern.
  line(ctx, 200, 96, 200, 128, '#5a3a22', 3);
  rect(ctx, 190, 128, 20, 26, '#33415c');
  if (v('lantern-lit')) { rect(ctx, 194, 134, 12, 14, '#3a4a5a'); }
  else { rect(ctx, 194, 134, 12, 14, '#ffd94d'); circle(ctx, 200, 141, 18, 'rgba(255, 217, 77, 0.25)'); }
  // Flowers by the stream.
  flower(ctx, 90, 372, '#c084fc', '#fff3b0');
  flower(ctx, 180, 375, v('flower-purple') ? '#c084fc' : '#ff6b9d', '#fff3b0');
  flower(ctx, 470, 372, '#ff9f43', '#fff3b0');
  // Sticking-out branch.
  if (!v('branch-gone')) { line(ctx, 500, 240, 540, 210, '#5a3a22', 5); line(ctx, 525, 224, 532, 206, '#5a3a22', 3); }
}

// --- Scene 5: Starlight Observatory ------------------------------------------
const observatoryDiffs = [
  { id: 'saturn-ring', x: 90, y: 90, r: 26, label: 'Saturn lost its ring' },
  { id: 'rocket-flame', x: 120, y: 340, r: 14, label: 'the rocket flame went out' },
  { id: 'star-extra', x: 260, y: 50, r: 10, label: 'an extra star' },
  { id: 'visor', x: 480, y: 140, r: 16, label: 'the astronaut\u2019s visor' },
  { id: 'steam-gone', x: 240, y: 300, r: 14, label: 'the cocoa steam' },
  { id: 'book-red', x: 510, y: 280, r: 12, label: 'a book changed colour' },
  { id: 'chart-line', x: 105, y: 170, r: 20, label: 'the chart line flipped' },
  { id: 'earth-clouds', x: 410, y: 130, r: 30, label: 'the clouds over Earth' },
  { id: 'button-red', x: 90, y: 360, r: 12, label: 'a button changed colour' },
  { id: 'telescope-tilt', x: 350, y: 290, r: 26, label: 'the telescope tilted' },
];
function drawObservatory(ctx, v) {
  const sky = ctx.createLinearGradient(0, 0, 0, 400);
  sky.addColorStop(0, '#0a0a2a'); sky.addColorStop(1, '#1e1e4e');
  rect(ctx, 0, 0, 560, 400, sky);
  const rnd = mulberry32(42);
  for (let i = 0; i < 22; i += 1) star(ctx, 15 + rnd() * 530, 10 + rnd() * 300, 1.5 + rnd() * 2, '#ffffff');
  if (v('star-extra')) star(ctx, 260, 50, 4, '#ffffff');
  // Big window with Earth.
  rect(ctx, 300, 40, 220, 180, '#0a0a2a');
  ctx.strokeStyle = '#4a4a7a'; ctx.lineWidth = 5; ctx.strokeRect(300, 40, 220, 180);
  line(ctx, 410, 40, 410, 220, '#4a4a7a', 4); line(ctx, 300, 130, 520, 130, '#4a4a7a', 4);
  circle(ctx, 410, 130, 62, '#2b6cb0');
  ellipse(ctx, 390, 110, 22, 12, '#3f9e4d'); ellipse(ctx, 428, 148, 26, 13, '#3f9e4d'); ellipse(ctx, 415, 100, 12, 8, '#3f9e4d');
  if (!v('earth-clouds')) {
    ellipse(ctx, 388, 128, 20, 6, 'rgba(255,255,255,0.85)');
    ellipse(ctx, 430, 118, 16, 5, 'rgba(255,255,255,0.85)');
  }
  // Saturn and Mars.
  circle(ctx, 90, 90, 22, '#e8b06a');
  if (!v('saturn-ring')) { ctx.strokeStyle = '#f4ead8'; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(90, 90, 36, 10, -0.4, 0, Math.PI * 2); ctx.stroke(); }
  circle(ctx, 180, 60, 12, '#d94f4f');
  // Star chart on the wall.
  rect(ctx, 60, 140, 90, 60, '#f4ead8');
  ctx.strokeStyle = '#33415c'; ctx.lineWidth = 2; ctx.strokeRect(60, 140, 90, 60);
  if (v('chart-line')) { line(ctx, 68, 188, 142, 152, '#d94f4f', 3); }
  else { line(ctx, 68, 152, 142, 188, '#d94f4f', 3); }
  circle(ctx, 68, v('chart-line') ? 188 : 152, 3, '#33415c');
  circle(ctx, 142, v('chart-line') ? 152 : 188, 3, '#33415c');
  // Astronaut floating.
  ellipse(ctx, 480, 150, 18, 24, '#eef1f5');
  circle(ctx, 480, 122, 13, '#eef1f5');
  circle(ctx, 480, 122, 9, v('visor') ? '#ffd94d' : '#2b3a67');
  if (v('visor')) { circle(ctx, 477, 120, 1.5, '#222'); circle(ctx, 483, 120, 1.5, '#222'); }
  ellipse(ctx, 458, 150, 7, 14, '#cfd6de'); ellipse(ctx, 502, 150, 7, 14, '#cfd6de');
  rect(ctx, 472, 148, 16, 10, '#5aa9ff');
  // Telescope on its tripod.
  line(ctx, 350, 330, 330, 372, '#8b93a3', 5); line(ctx, 350, 330, 370, 372, '#8b93a3', 5); line(ctx, 350, 330, 350, 372, '#8b93a3', 5);
  ctx.save(); ctx.translate(350, 300); ctx.rotate(v('telescope-tilt') ? -0.35 : -0.7);
  rect(ctx, -8, -14, 90, 28, '#5aa9ff'); rect(ctx, 78, -18, 14, 36, '#33415c'); circle(ctx, -8, 0, 12, '#33415c');
  ctx.restore();
  // Desk with rocket model, mug and control panel.
  rect(ctx, 40, 330, 480, 14, '#6b4226');
  rect(ctx, 60, 344, 12, 40, '#5a3a22'); rect(ctx, 488, 344, 12, 40, '#5a3a22');
  // Rocket model.
  poly(ctx, [[108, 330], [132, 330], [126, 296], [114, 296]], '#eef1f5');
  circle(ctx, 120, 296, 6, '#d94f4f');
  poly(ctx, [[108, 330], [100, 342], [110, 330]], '#d94f4f');
  poly(ctx, [[132, 330], [140, 342], [130, 330]], '#d94f4f');
  circle(ctx, 120, 312, 4, '#5aa9ff');
  if (!v('rocket-flame')) poly(ctx, [[114, 330], [126, 330], [120, 352]], '#ff9f43');
  // Mug of cocoa.
  rect(ctx, 228, 306, 24, 24, '#e76f88');
  ctx.strokeStyle = '#e76f88'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(254, 316, 7, -Math.PI / 2, Math.PI / 2); ctx.stroke();
  if (!v('steam-gone')) {
    ctx.strokeStyle = 'rgba(200,200,200,0.7)'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(236, 302); ctx.quadraticCurveTo(232, 294, 238, 288); ctx.stroke();
  }
  // Control panel with buttons.
  rect(ctx, 60, 344, 120, 30, '#33415c');
  circle(ctx, 90, 359, 8, v('button-red') ? '#e33' : '#7ee0a3');
  circle(ctx, 120, 359, 8, '#ffd94d'); circle(ctx, 150, 359, 8, '#5aa9ff');
  // Bookshelf.
  rect(ctx, 490, 250, 56, 100, '#6b4226');
  const books = ['#d94f4f', '#5aa9ff', '#7ee0a3', '#ffd94d', '#c084fc'];
  books.forEach((c, i) => rect(ctx, 494 + i * 10, 258 + (i % 2) * 4, 8, 46 - (i % 2) * 4, i === 3 ? (v('book-red') ? '#5aa9ff' : '#ffd94d') : c));
  rect(ctx, 490, 304, 56, 6, '#5a3a22');
  rect(ctx, 494, 314, 10, 30, '#d94f4f'); rect(ctx, 506, 314, 10, 30, '#7ee0a3'); rect(ctx, 518, 314, 10, 30, '#5aa9ff');
}

// --- Registry ----------------------------------------------------------------
export const SCENES = {
  meadow: { id: 'meadow', name: 'Sunny Meadow', diffs: meadowDiffs, draw: drawMeadow },
  harbor: { id: 'harbor', name: 'Harbor at Dusk', diffs: harborDiffs, draw: drawHarbor },
  kitchen: { id: 'kitchen', name: 'Cozy Kitchen', diffs: kitchenDiffs, draw: drawKitchen },
  forest: { id: 'forest', name: 'Enchanted Forest', diffs: forestDiffs, draw: drawForest },
  observatory: { id: 'observatory', name: 'Starlight Observatory', diffs: observatoryDiffs, draw: drawObservatory },
};

export function getScene(id) { return SCENES[id]; }

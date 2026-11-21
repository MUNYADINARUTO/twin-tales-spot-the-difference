// Every tuning number, colour and level in one place. The playfield is a fixed
// 1280x720 logical area; the renderer scales it to the window, so no rule below
// depends on the screen size. A scene is drawn in its own 560x400 space.
export const FIELD = { width: 1280, height: 720 };

// The two picture panels, side by side.
export const PANEL = { width: 560, height: 400, y: 108, gap: 80 };
export const PANEL_LEFT = { x: 40, y: PANEL.y, width: PANEL.width, height: PANEL.height };
export const PANEL_RIGHT = { x: 680, y: PANEL.y, width: PANEL.width, height: PANEL.height };

// The simulation's fixed step, in seconds: 60 updates a second whatever the display's rate.
export const STEP = 1 / 60;

export const GAME = {
  title: 'Twin Tales',
  subtitle: 'Spot the Difference',
  // Points for a find, before the combo bonus.
  findPoints: 100,
  // Extra points per step of the combo chain.
  comboStep: 25,
  // Seconds lost on a wrong click.
  missPenaltySeconds: 3,
  // Points a hint costs, and how many hints each level grants.
  hintCost: 50,
  hintsPerLevel: 3,
  // Seconds a hint's pulse lasts.
  hintSeconds: 2.5,
  // Points per second left when a level is cleared.
  timeBonusPerSecond: 10,
  // Points for clearing a level.
  levelBonus: 250,
};

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'twin-tales.best';

export const PALETTE = {
  backdrop: '#14101f',
  header: '#1d1830',
  panelBorder: '#3a2f5e',
  panelGap: '#241d3a',
  text: '#f4efff',
  muted: '#b3a8d6',
  accent: '#ffd166',
  accent2: '#7ee0a3',
  danger: '#ff6b6b',
  found: '#7ee0a3',
  hint: '#ffd166',
  button: '#2c2350',
  buttonHover: '#3a2f6b',
  timer: '#7ee0a3',
  timerLow: '#ff6b6b',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/**
 * The five rounds, easiest first. `scene` names the scene module's scene,
 * `seconds` is the level's clock, `par` is the find count a good run reaches.
 */
export const LEVELS = [
  { scene: 'meadow', name: 'Sunny Meadow', seconds: 120, blurb: 'A quiet morning in the meadow. Seven little things differ.' },
  { scene: 'harbor', name: 'Harbor at Dusk', seconds: 150, blurb: 'The sun is going down over the harbor. Eight things differ.' },
  { scene: 'kitchen', name: 'Cozy Kitchen', seconds: 150, blurb: 'Tea is on and the cat is watching. Eight things differ.' },
  { scene: 'forest', name: 'Enchanted Forest', seconds: 180, blurb: 'Fireflies are out and the owl is awake. Nine things differ.' },
  { scene: 'observatory', name: 'Starlight Observatory', seconds: 180, blurb: 'The telescope is pointed at the stars. Ten things differ.' },
];

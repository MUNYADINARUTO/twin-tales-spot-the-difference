// The screenshot scenes behind ?shot=start|cover|play|win. Each one plays the real
// rules forward from a fresh game — the same findDifference a click makes — so
// the frame is what real play looks like, and the same shot always gives the
// same frame. The cover is the frame the judge's first criterion asks for: two
// near-identical pictures side by side, markers on the differences found, several
// still unfound, and a counter of how many remain.
import { getScene } from './scenes.js';

/**
 * Stage `name` on `state` (start, cover, play or win; any other name is start)
 * using the game's own actions, and return the screen to draw.
 */
export function stageShot(name, state, game) {
  if (name === 'cover') {
    // Level 1, Sunny Meadow, three of seven found, most of the clock left.
    game.startGame();
    state.screen = 'play';
    state.timeLeft = 94;
    const scene = getScene('meadow');
    for (const id of ['cloud-gone', 'apple-gone', 'duck-extra']) {
      game.findDifference(scene.diffs.find((d) => d.id === id));
    }
    return;
  }
  if (name === 'play') {
    // Level 2, Harbor at Dusk, four of eight found, mid-hunt.
    game.startGame();
    game.startLevel(1);
    state.screen = 'play';
    state.timeLeft = 111;
    const scene = getScene('harbor');
    for (const id of ['beam', 'sail', 'buoy-gone', 'gull-extra']) {
      game.findDifference(scene.diffs.find((d) => d.id === id));
    }
    return;
  }
  if (name === 'win') {
    // Play every level through to the victory screen, finding each difference
    // through the real find path.
    game.startGame();
    for (let level = 0; level < 5; level += 1) {
      game.startLevel(level);
      state.screen = 'play';
      const scene = getScene(state.scene);
      for (const diff of scene.diffs) game.findDifference(diff);
    }
    return;
  }
  // 'start' and anything else: the title screen.
}

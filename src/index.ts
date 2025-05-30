import { GameEngine } from './core/GameEngine';

window.addEventListener('load', () => {
  const game = new GameEngine();
  game.start();
});

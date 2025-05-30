import { GameEngine } from './core/GameEngine';
import { ItemDatabase } from './game/systems/ItemDatabase';

window.addEventListener('load', () => {
  // Initialize game systems
  ItemDatabase.initialize();
  
  const game = new GameEngine();
  game.start();
});

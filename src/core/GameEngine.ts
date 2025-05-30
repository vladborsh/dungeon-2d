import { GAME_CONSTANTS } from '../constants/gameConstants';
import type { GameObject } from '../interfaces/gameInterfaces';
import { Player } from '../game/entities/Player';
import { Level } from '../game/levels/Level';
import { InputManager } from './InputManager';

export class GameEngine {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly gameObjects: Set<GameObject>;
  private readonly level: Level;
  private readonly inputManager: InputManager;
  private animationFrameId: number;
  private frameCount: number;
  private fps: number;
  private readonly fpsUpdateInterval: number;
  private lastFpsUpdate: number;
  private lastFrameTime: number;
  private readonly targetFPS: number;
  private readonly frameTime: number;

  public constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = GAME_CONSTANTS.CANVAS.WIDTH;
    this.canvas.height = GAME_CONSTANTS.CANVAS.HEIGHT;
    
    const container = document.getElementById('game-container');
    if (!container) {
      throw new Error('Game container not found');
    }
    container.appendChild(this.canvas);
    
    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get 2D context');
    }
    this.ctx = context;
    
    // Optimize canvas rendering
    this.ctx.imageSmoothingEnabled = false; // Disable smoothing for pixel art
    this.ctx.textBaseline = 'top';
    
    this.gameObjects = new Set();
    this.level = new Level();
    this.inputManager = new InputManager();
    this.animationFrameId = 0;
    
    // Initialize FPS tracking
    this.frameCount = 0;
    this.fps = 0;
    this.fpsUpdateInterval = 1000; // Update FPS display every second
    this.lastFpsUpdate = performance.now();
    this.lastFrameTime = performance.now();
    this.targetFPS = 60;
    this.frameTime = 1000 / this.targetFPS;

    // Add player at the start position of the maze
    const startPosition = this.level.getStartPosition();
    const player = new Player({
      x: startPosition.x + GAME_CONSTANTS.TILE_SIZE / 2 - GAME_CONSTANTS.PLAYER.SIZE / 2,
      y: startPosition.y + GAME_CONSTANTS.TILE_SIZE / 2 - GAME_CONSTANTS.PLAYER.SIZE / 2
    });
    player.setInputManager(this.inputManager);
    player.setLevel(this.level);
    this.addGameObject(player);
  }

  public start(): void {
    this.gameLoop();
  }

  public stop(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  public addGameObject(object: GameObject): void {
    this.gameObjects.add(object);
  }

  public removeGameObject(object: GameObject): void {
    this.gameObjects.delete(object);
  }

  private gameLoop(): void {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;
    
    // Frame rate limiting - only update if enough time has passed
    if (deltaTime < this.frameTime) {
      this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
      return;
    }
    
    this.lastFrameTime = currentTime;
    
    // Update FPS counter
    this.frameCount++;
    if (currentTime - this.lastFpsUpdate >= this.fpsUpdateInterval) {
      this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastFpsUpdate));
      this.frameCount = 0;
      this.lastFpsUpdate = currentTime;
    }
    
    this.update();
    this.render();
    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
  }

  private update(): void {
    for (const object of this.gameObjects) {
      object.update();
    }
  }

  private render(): void {
    // Clear canvas
    this.ctx.fillStyle = GAME_CONSTANTS.COLORS.BACKGROUND;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Render level
    this.level.render(this.ctx);

    // Render all game objects
    for (const object of this.gameObjects) {
      object.render(this.ctx);
    }

    // Render debug info
    this.renderDebugInfo();
  }

  private renderDebugInfo(): void {
    this.ctx.save();
    
    // Set up debug text style
    this.ctx.font = '14px monospace';
    this.ctx.fillStyle = '#00FF00';
    this.ctx.textBaseline = 'top';
    
    // Render FPS counter
    this.ctx.fillText(`FPS: ${this.fps}`, 10, 10);
    
    this.ctx.restore();
  }
}

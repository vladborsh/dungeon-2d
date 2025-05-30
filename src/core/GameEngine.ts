import { GAME_CONSTANTS } from '../constants/gameConstants';
import type { GameObject } from '../interfaces/gameInterfaces';
import { Player } from '../game/entities/Player';
import { Level } from '../game/levels/Level';
import { InputManager } from './InputManager';
import { Camera } from './Camera';
import { LootSystem } from '../game/systems/LootSystem';
import { LootGenerator } from '../game/systems/LootGenerator';
import { DungeonLootManager } from '../game/systems/DungeonLootManager';
import { EnemyManager } from '../game/systems/EnemyManager';
import { EventHandler } from '../game/systems/EventHandler';
import { InventoryUI } from '../rendering/ui/InventoryUI';
import { HelpUI } from '../rendering/ui/HelpUI';
import { PlayerInfoUI } from '../rendering/ui/PlayerInfoUI';
import { ParticleSystem } from '../rendering/effects/ParticleSystem';

export class GameEngine {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly gameObjects: Set<GameObject>;
  private readonly level: Level;
  private readonly inputManager: InputManager;
  private readonly camera: Camera;
  private readonly lootSystem: LootSystem;
  private readonly lootGenerator: LootGenerator;
  private readonly dungeonLootManager: DungeonLootManager;
  private readonly enemyManager: EnemyManager;
  private readonly eventHandler: EventHandler;
  private readonly inventoryUI: InventoryUI;
  private readonly helpUI: HelpUI;
  private readonly playerInfoUI: PlayerInfoUI;
  private readonly particleSystem: ParticleSystem;
  private player: Player | null;
  private animationFrameId: number;
  private frameCount: number;
  private fps: number;
  private readonly fpsUpdateInterval: number;
  private lastFpsUpdate: number;
  private lastFrameTime: number;
  private readonly targetFPS: number;
  private readonly frameTime: number;
  private previousPlayerPosition: { x: number; y: number } | null;

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
    this.camera = new Camera();
    this.lootSystem = new LootSystem();
    this.particleSystem = new ParticleSystem();
    this.inventoryUI = new InventoryUI({
      containerId: 'inventory-container',
      slotSize: 32,
      slotsPerRow: 6,
      padding: 4
    });
    
    this.helpUI = new HelpUI({
      x: (GAME_CONSTANTS.CANVAS.WIDTH - 400) / 2,
      y: (GAME_CONSTANTS.CANVAS.HEIGHT - 500) / 2,
      width: 400,
      height: 500
    });
    
    this.playerInfoUI = new PlayerInfoUI({
      containerId: 'player-info-panel'
    });
    this.player = null;
    this.animationFrameId = 0;
    this.previousPlayerPosition = null;
    
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
    this.player = new Player({
      x: startPosition.x + GAME_CONSTANTS.TILE_SIZE / 2 - GAME_CONSTANTS.PLAYER.SIZE / 2,
      y: startPosition.y + GAME_CONSTANTS.TILE_SIZE / 2 - GAME_CONSTANTS.PLAYER.SIZE / 2
    });
    this.player.setInputManager(this.inputManager);
    this.player.setLevel(this.level);
    this.addGameObject(this.player);
    
    // Connect inventory UI to player
    this.inventoryUI.setInventory(this.player.getInventory());
    
    // Connect player info UI to player
    this.playerInfoUI.setPlayer(this.player);
    
    // Initialize specialized systems
    this.lootGenerator = new LootGenerator(this.lootSystem);
    this.dungeonLootManager = new DungeonLootManager(this.level, this.lootGenerator);
    this.enemyManager = new EnemyManager(this.level);
    this.eventHandler = new EventHandler(
      this.canvas,
      this.player,
      this.lootSystem,
      this.inventoryUI,
      this.helpUI,
      this.camera
    );
    
    // Generate loot throughout the dungeon
    this.dungeonLootManager.generateDungeonLoot();
    
    // Generate enemies throughout the dungeon
    this.enemyManager.initializeEnemies();
  }

  public start(): void {
    this.gameLoop();
  }

  public stop(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.eventHandler.destroy();
  }

  public addGameObject(object: GameObject): void {
    this.gameObjects.add(object);
  }

  public removeGameObject(object: GameObject): void {
    this.gameObjects.delete(object);
  }

  /**
   * Get the camera for external access
   */
  public getCamera(): Camera {
    return this.camera;
  }

  /**
   * Get the loot generator for external access
   */
  public getLootGenerator(): LootGenerator {
    return this.lootGenerator;
  }

  /**
   * Get the loot system for external access
   */
  public getLootSystem(): LootSystem {
    return this.lootSystem;
  }

  /**
   * Get the dungeon loot manager for external access
   */
  public getDungeonLootManager(): DungeonLootManager {
    return this.dungeonLootManager;
  }

  /**
   * Get the enemy manager for external access
   */
  public getEnemyManager(): EnemyManager {
    return this.enemyManager;
  }

  /**
   * Get the particle system for external access
   */
  public getParticleSystem(): ParticleSystem {
    return this.particleSystem;
  }

  private generatePlayerTrail(): void {
    if (!this.player) return;

    const currentPosition = {
      x: this.player.position.x + this.player.size.width / 2,
      y: this.player.position.y + this.player.size.height / 2
    };

    // Check if player is moving
    if (this.previousPlayerPosition) {
      const deltaX = currentPosition.x - this.previousPlayerPosition.x;
      const deltaY = currentPosition.y - this.previousPlayerPosition.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Only generate trail if player is moving fast enough
      if (distance > 1) {
        // Generate multiple trail particles per frame when moving
        for (let i = 0; i < GAME_CONSTANTS.PARTICLES.TRAIL.SPAWN_RATE; i++) {
          this.particleSystem.createTrailParticle({
            x: currentPosition.x + (Math.random() - 0.5) * this.player.size.width,
            y: currentPosition.y + (Math.random() - 0.5) * this.player.size.height
          });
        }
      }
    }

    this.previousPlayerPosition = { ...currentPosition };
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
    
    // Update camera to follow player
    if (this.player) {
      const playerCenter = {
        x: this.player.position.x + this.player.size.width / 2,
        y: this.player.position.y + this.player.size.height / 2
      };
      this.camera.update(playerCenter);
    }
    
    // Update enemy system
    if (this.player) {
      this.enemyManager.update(this.player);
    }
    
    // Update particle system
    this.particleSystem.update();
    
    // Generate trail particles behind player
    if (this.player) {
      this.generatePlayerTrail();
    }
    
    // Update loot system
    this.lootSystem.updateItemDrops();
    
    // Auto-collect nearby items
    if (this.player) {
      const collectedDrops = this.lootSystem.checkItemCollection(
        this.player.position,
        this.player.size
      );

      collectedDrops.forEach(drop => {
        // Create explosion particles when item is collected
        this.particleSystem.createExplosionParticles(
          {
            x: drop.position.x + drop.size.width / 2,
            y: drop.position.y + drop.size.height / 2
          },
          GAME_CONSTANTS.PARTICLES.EXPLOSION.COUNT
        );
        
        this.player!.collectItem(drop.getItem(), drop.getQuantity());
      });
    }
  }

  private render(): void {
    // Clear canvas
    this.ctx.fillStyle = GAME_CONSTANTS.COLORS.BACKGROUND;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Apply camera transformation for world objects
    this.camera.apply(this.ctx);

    // Render level
    this.level.render(this.ctx);

    // Render particles (behind game objects)
    this.particleSystem.render(this.ctx);

    // Render item drops (in front of enemies)
    this.lootSystem.renderItemDrops(this.ctx);

    // Render enemies (behind collectibles)
    this.enemyManager.render(this.ctx);

    // Render all game objects (player in front of everything)
    for (const object of this.gameObjects) {
      object.render(this.ctx);
    }

    // Restore camera transformation for UI elements
    this.camera.restore(this.ctx);

    // Render UI components (fixed to screen)
    this.playerInfoUI.render();
    this.inventoryUI.render();
    
    // Render help hint button (always visible, fixed to screen)
    this.helpUI.renderHintButton(this.ctx);
    
    // Render help UI (only if visible, fixed to screen)
    this.helpUI.render(this.ctx);
  }
}

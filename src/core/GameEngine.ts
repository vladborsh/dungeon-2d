import { GAME_CONSTANTS } from '../constants/gameConstants';
import type { GameObject, Position } from '../interfaces/gameInterfaces';
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
import { CanvasOverlayUI } from '../rendering/ui/CanvasOverlayUI';
import { ParticleSystem } from '../rendering/effects/ParticleSystem';
import { PlayerTrailSystem } from '../game/systems/PlayerTrailSystem';
import { FogOfWar } from '../rendering/effects/FogOfWar';
import { DamageSystem } from '../game/systems/DamageSystem';

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
  private readonly canvasOverlayUI: CanvasOverlayUI;
  private readonly particleSystem: ParticleSystem;
  private readonly fogOfWar: FogOfWar;
  private readonly damageSystem: DamageSystem;
  private player: Player | null;
  private readonly playerTrailSystem: PlayerTrailSystem;
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
    this.camera = new Camera();
    this.lootSystem = new LootSystem();
    this.particleSystem = new ParticleSystem();
    this.fogOfWar = new FogOfWar();
    this.damageSystem = new DamageSystem(this);
    
    // Initialize UI systems first
    this.helpUI = new HelpUI({
      x: (GAME_CONSTANTS.CANVAS.WIDTH - 400) / 2,
      y: (GAME_CONSTANTS.CANVAS.HEIGHT - 500) / 2,
      width: 400,
      height: 500
    });
    
    this.inventoryUI = new InventoryUI({
      slotSize: 32,
      slotsPerRow: 6,
      padding: 4
    });
    
    this.canvasOverlayUI = new CanvasOverlayUI({
      width: 200,
      height: 200,
      padding: 10
    });
    
    // Initialize specialized systems after UI
    this.lootGenerator = new LootGenerator(this.lootSystem);
    this.dungeonLootManager = new DungeonLootManager(this.level, this.lootGenerator);
    this.enemyManager = new EnemyManager(this.level, this);
    
    // Add player at the start position of the maze
    const startPosition = this.level.getStartPosition();
    this.player = new Player({
      x: startPosition.x + GAME_CONSTANTS.TILE_SIZE / 2 - GAME_CONSTANTS.PLAYER.SIZE / 2,
      y: startPosition.y + GAME_CONSTANTS.TILE_SIZE / 2 - GAME_CONSTANTS.PLAYER.SIZE / 2
    }, this);
    // Create event handler last, after all UI components are initialized
    this.eventHandler = new EventHandler(
      this.canvas,
      this.player,
      this.lootSystem,
      this.inventoryUI,
      this.helpUI,
      this.camera,
      this.enemyManager
    );

    this.player.setInputManager(this.inputManager);
    this.player.setLevel(this.level);
    this.addGameObject(this.player);
    
    // Initialize player trail system
    this.playerTrailSystem = new PlayerTrailSystem(this.player, this.particleSystem);
    
    // Connect inventory UI to player
    this.inventoryUI.setInventory(this.player.getInventory());
    
    // Connect player info UI to player
    this.canvasOverlayUI.setPlayer(this.player);
    
    // Generate loot throughout the dungeon
    this.dungeonLootManager.generateDungeonLoot();
    
    // Generate enemies throughout the dungeon
    this.enemyManager.initializeEnemies();
    
    // Initialize FPS tracking
    this.frameCount = 0;
    this.fps = 0;
    this.animationFrameId = 0;
    this.fpsUpdateInterval = 1000; // Update FPS display every second
    this.lastFpsUpdate = performance.now();
    this.lastFrameTime = performance.now();
    this.targetFPS = 60;
    this.frameTime = 1000 / this.targetFPS;
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

  /**
   * Get the damage system for external access
   */
  public getDamageSystem(): DamageSystem {
    return this.damageSystem;
  }

  /**
   * Get the current player for external access
   */
  public getPlayer(): Player | null {
    return this.player;
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
    
    // Update player trail system
    if (this.player) {
      this.playerTrailSystem.update();
    }
    
    // Update loot system with current player position and drops
    if (this.player) {
      this.lootSystem.updatePlayerPosition(this.player.position);
    }
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

    // Render level floor and objects (but not walls)
    this.level.render(this.ctx);

    // Render background particles (effects like trails)
    this.particleSystem.renderBackgroundParticles(this.ctx);

    // Render item drops (in front of floor)
    this.lootSystem.renderItemDrops(this.ctx);

    // Create a list of all renderable entities for depth sorting
    const renderableEntities: { position: Position; render: (ctx: CanvasRenderingContext2D) => void }[] = [
      ...this.enemyManager.getEnemies().map(enemy => ({
        position: enemy.position,
        render: (ctx: CanvasRenderingContext2D) => {
          if (enemy.isAlive()) {
            enemy.render(ctx);
          }
        }
      })),
      ...Array.from(this.gameObjects).map(obj => ({
        position: obj.position,
        render: (ctx: CanvasRenderingContext2D) => obj.render(ctx)
      }))
    ];

    // Sort entities by Y position
    renderableEntities.sort((a, b) => a.position.y - b.position.y);

    // Render all entities in order
    renderableEntities.forEach(entity => {
      entity.render(this.ctx);
    });

    // Render particles on top of everything except walls
    this.particleSystem.renderEnemyAttackParticles(this.ctx);
    this.particleSystem.renderPlayerAttackParticles(this.ctx);

    // Render walls last so they appear in front of everything
    this.level.renderWalls(this.ctx);

    // Restore camera transformation for UI elements
    this.camera.restore(this.ctx);

    // Render fog of war effect if player exists (after world render but before UI)
    if (this.player) {
      this.fogOfWar.render(this.ctx, this.player, this.camera);
    }

    // Render UI components (fixed to screen, on top of fog)
    this.canvasOverlayUI.render(this.ctx);
    this.inventoryUI.render(this.ctx);
    
    // Render help hint button (always visible, fixed to screen)
    this.helpUI.renderHintButton(this.ctx);
    
    // Render help UI (only if visible, fixed to screen)
    this.helpUI.render(this.ctx);
  }
}

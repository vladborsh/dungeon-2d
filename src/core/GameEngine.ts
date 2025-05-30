import { GAME_CONSTANTS } from '../constants/gameConstants';
import type { GameObject } from '../interfaces/gameInterfaces';
import { Player } from '../game/entities/Player';
import { Level } from '../game/levels/Level';
import { InputManager } from './InputManager';
import { LootSystem } from '../game/systems/LootSystem';
import { InventoryUI } from '../rendering/ui/InventoryUI';

export class GameEngine {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly gameObjects: Set<GameObject>;
  private readonly level: Level;
  private readonly inputManager: InputManager;
  private readonly lootSystem: LootSystem;
  private readonly inventoryUI: InventoryUI;
  private player: Player | null;
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
    this.lootSystem = new LootSystem();
    this.inventoryUI = new InventoryUI({
      x: 0,
      y: 0,
      slotSize: 32,
      slotsPerRow: 6,
      padding: 4
    });
    this.player = null;
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
    this.player = new Player({
      x: startPosition.x + GAME_CONSTANTS.TILE_SIZE / 2 - GAME_CONSTANTS.PLAYER.SIZE / 2,
      y: startPosition.y + GAME_CONSTANTS.TILE_SIZE / 2 - GAME_CONSTANTS.PLAYER.SIZE / 2
    });
    this.player.setInputManager(this.inputManager);
    this.player.setLevel(this.level);
    this.addGameObject(this.player);
    
    // Connect inventory UI to player
    this.inventoryUI.setInventory(this.player.getInventory());
    
    // Set up input event handlers
    this.setupEventHandlers();
    
    // Generate some initial loot for testing
    this.generateTestLoot();
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
    
    // Update loot system
    this.lootSystem.updateItemDrops();
    
    // Auto-collect nearby items
    if (this.player) {
      const collectedDrops = this.lootSystem.checkItemCollection(
        this.player.position,
        this.player.size
      );

      collectedDrops.forEach(drop => {
        this.player!.collectItem(drop.getItem(), drop.getQuantity());
      });
    }
  }

  private render(): void {
    // Clear canvas
    this.ctx.fillStyle = GAME_CONSTANTS.COLORS.BACKGROUND;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Render level
    this.level.render(this.ctx);

    // Render item drops
    this.lootSystem.renderItemDrops(this.ctx);

    // Render all game objects
    for (const object of this.gameObjects) {
      object.render(this.ctx);
    }

    // Render UI
    this.inventoryUI.render(this.ctx);
    
    // Render player stats
    this.renderPlayerStats();

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

  private setupEventHandlers(): void {
    // Keyboard event handlers
    document.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'i':
        case 'I':
          this.inventoryUI.toggle();
          break;
        case 'e':
        case 'E':
          this.handleItemCollection();
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
        case '0':
          const slotNumber = event.key === '0' ? 10 : parseInt(event.key);
          this.inventoryUI.selectHotbarSlot(slotNumber);
          break;
      }
    });

    // Mouse event handlers
    this.canvas.addEventListener('click', (event) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      
      this.inventoryUI.handleClick(mouseX, mouseY);
    });
  }

  private handleItemCollection(): void {
    if (!this.player) return;

    const collectedDrops = this.lootSystem.checkItemCollection(
      this.player.position,
      this.player.size
    );

    collectedDrops.forEach(drop => {
      const success = this.player!.collectItem(drop.getItem(), drop.getQuantity());
      if (!success) {
        // If inventory is full, put the item back
        this.lootSystem.createItemDrop(drop.getItem(), drop.getQuantity(), drop.position);
      }
    });
  }

  private generateTestLoot(): void {
    if (!this.player) return;

    // Generate some test loot around the player
    const playerPos = this.player.position;
    
    // Generate random loot
    this.lootSystem.generateRandomLoot(1, {
      x: playerPos.x + 100,
      y: playerPos.y + 50
    });
    
    this.lootSystem.generateRandomLoot(2, {
      x: playerPos.x - 80,
      y: playerPos.y + 80
    });
    
    // Generate loot from specific tables
    this.lootSystem.generateLoot('treasure_chest', 3, {
      x: playerPos.x + 150,
      y: playerPos.y - 100
    });
  }

  private renderPlayerStats(): void {
    if (!this.player) return;

    this.ctx.save();
    
    const stats = this.player.getStats();
    const equipment = this.player.getInventory().getEquipment();
    
    // Set up stats display style
    this.ctx.font = '12px Arial';
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.textBaseline = 'top';
    
    // Render stats background
    const statsWidth = 180;
    const statsHeight = 120;
    const statsX = this.canvas.width - statsWidth - 10;
    const statsY = 10;
    
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(statsX, statsY, statsWidth, statsHeight);
    
    this.ctx.strokeStyle = '#555555';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(statsX, statsY, statsWidth, statsHeight);
    
    // Render stats text
    let yOffset = statsY + 10;
    const lineHeight = 14;
    
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillText(`Level: ${stats.level}`, statsX + 10, yOffset);
    yOffset += lineHeight;
    
    this.ctx.fillText(`HP: ${stats.health}/${stats.maxHealth}`, statsX + 10, yOffset);
    yOffset += lineHeight;
    
    this.ctx.fillText(`MP: ${stats.mana}/${stats.maxMana}`, statsX + 10, yOffset);
    yOffset += lineHeight;
    
    this.ctx.fillText(`ATK: ${stats.attack}`, statsX + 10, yOffset);
    yOffset += lineHeight;
    
    this.ctx.fillText(`DEF: ${stats.defense}`, statsX + 10, yOffset);
    yOffset += lineHeight;
    
    this.ctx.fillText(`SPD: ${stats.speed}`, statsX + 10, yOffset);
    yOffset += lineHeight;
    
    this.ctx.fillText(`EXP: ${stats.experience}/${stats.experienceToNext}`, statsX + 10, yOffset);
    
    // Render health bar
    const barWidth = 100;
    const barHeight = 8;
    const healthBarX = statsX + 10;
    const healthBarY = statsY + statsHeight - 30;
    
    // Health bar background
    this.ctx.fillStyle = '#333333';
    this.ctx.fillRect(healthBarX, healthBarY, barWidth, barHeight);
    
    // Health bar fill
    const healthPercent = stats.health / stats.maxHealth;
    this.ctx.fillStyle = healthPercent > 0.5 ? '#00FF00' : healthPercent > 0.25 ? '#FFFF00' : '#FF0000';
    this.ctx.fillRect(healthBarX, healthBarY, barWidth * healthPercent, barHeight);
    
    // Mana bar
    const manaBarY = healthBarY + barHeight + 4;
    
    // Mana bar background
    this.ctx.fillStyle = '#333333';
    this.ctx.fillRect(healthBarX, manaBarY, barWidth, barHeight);
    
    // Mana bar fill
    const manaPercent = stats.mana / stats.maxMana;
    this.ctx.fillStyle = '#0080FF';
    this.ctx.fillRect(healthBarX, manaBarY, barWidth * manaPercent, barHeight);
    
    this.ctx.restore();
  }
}

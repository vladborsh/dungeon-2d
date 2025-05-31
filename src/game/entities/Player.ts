import type { GameObject, Position, Size, PlayerStats, Item } from '../../interfaces/gameInterfaces';
import type { Level } from '../levels/Level';
import type { InputManager } from '../../core/InputManager';
import type { Enemy } from './Enemy';
import type { GameEngine } from '../../core/GameEngine';
import { Sprite } from '../../rendering/sprites/Sprite';
import { GAME_CONSTANTS } from '../../constants/gameConstants';
import { Inventory } from '../systems/Inventory';
import { ItemDatabase } from '../systems/ItemDatabase';

interface Velocity {
  readonly x: number;
  readonly y: number;
}

interface Acceleration {
  readonly x: number;
  readonly y: number;
}

export class Player implements GameObject {
  public position: Position;
  public readonly size: Size;
  private readonly sprite: Sprite;
  private velocity: Velocity;
  private acceleration: Acceleration;
  private readonly maxSpeed: number;
  private readonly baseAcceleration: number;
  private readonly friction: number;
  private level: Level | null;
  private inputManager: InputManager | null;
  private readonly gameEngine: GameEngine;
  private stats: PlayerStats;
  private readonly inventory: Inventory;

  private lastAttackTime: number;
  private isAttacking: boolean;
  private attackStartTime: number;

  public constructor(position: Position, gameEngine: GameEngine) {
    this.position = position;
    this.size = { width: GAME_CONSTANTS.PLAYER.SIZE, height: GAME_CONSTANTS.PLAYER.SIZE };
    this.sprite = this.createPlayerSprite();
    this.velocity = { x: 0, y: 0 };
    this.acceleration = { x: 0, y: 0 };
    this.baseAcceleration = GAME_CONSTANTS.PLAYER.ACCELERATION;
    this.maxSpeed = GAME_CONSTANTS.PLAYER.MAX_SPEED;
    this.friction = GAME_CONSTANTS.PLAYER.FRICTION;
    this.level = null;
    this.inputManager = null;
    this.gameEngine = gameEngine;
    this.lastAttackTime = 0;
    this.isAttacking = false;
    this.attackStartTime = 0;
    
    // Initialize player stats
    this.stats = {
      health: GAME_CONSTANTS.PLAYER.INITIAL_HEALTH,
      maxHealth: GAME_CONSTANTS.PLAYER.INITIAL_HEALTH,
      mana: 50,
      maxMana: 50,
      attack: 10,
      defense: 5,
      speed: GAME_CONSTANTS.PLAYER.SPEED,
      level: 1,
      experience: 0,
      experienceToNext: 100
    };

    // Initialize inventory
    this.inventory = new Inventory(GAME_CONSTANTS.INVENTORY.MAX_SLOTS);
    
    // Add starting equipment
    this.giveStartingItems();
  }

  public setInputManager(inputManager: InputManager): void {
    this.inputManager = inputManager;
  }

  public setLevel(level: Level): void {
    this.level = level;
  }

  private handleInput(): void {
    if (!this.inputManager) return;

    const input = this.inputManager.getInputState();
    
    // Calculate acceleration based on input
    let ax = 0;
    let ay = 0;

    if (input.left) ax -= this.baseAcceleration;
    if (input.right) ax += this.baseAcceleration;
    if (input.up) ay -= this.baseAcceleration;
    if (input.down) ay += this.baseAcceleration;

    // Normalize diagonal acceleration
    if (ax !== 0 && ay !== 0) {
      const normalizer = 1 / Math.sqrt(2);
      ax *= normalizer;
      ay *= normalizer;
    }

    // Update acceleration
    this.acceleration = { x: ax, y: ay };
  }

  private applyFriction(velocity: number): number {
    const absVelocity = Math.abs(velocity);
    const direction = Math.sign(velocity);
    
    if (absVelocity <= this.friction) {
      return 0;
    }
    
    return (absVelocity - this.friction) * direction;
  }

  public update(): void {
    this.handleInput();
    
    if (!this.level) return;

    // Update velocity with acceleration
    let newVelocityX = this.velocity.x + this.acceleration.x;
    let newVelocityY = this.velocity.y + this.acceleration.y;

    // Apply friction when no acceleration in that direction
    if (this.acceleration.x === 0) {
      newVelocityX = this.applyFriction(newVelocityX);
    }
    if (this.acceleration.y === 0) {
      newVelocityY = this.applyFriction(newVelocityY);
    }

    // Clamp velocity to max speed
    const speed = Math.sqrt(newVelocityX * newVelocityX + newVelocityY * newVelocityY);
    if (speed > this.maxSpeed) {
      const scale = this.maxSpeed / speed;
      newVelocityX *= scale;
      newVelocityY *= scale;
    }

    this.velocity = { x: newVelocityX, y: newVelocityY };

    // Update position based on velocity with collision checking
    const newX = this.position.x + this.velocity.x;
    const newY = this.position.y + this.velocity.y;

    // Handle collisions separately for X and Y to allow sliding along walls
    if (!this.checkCollision(newX, this.position.y, this.level)) {
      this.position = { ...this.position, x: newX };
    } else {
      // Stop horizontal movement on collision
      this.velocity = { ...this.velocity, x: 0 };
    }

    if (!this.checkCollision(this.position.x, newY, this.level)) {
      this.position = { ...this.position, y: newY };
    } else {
      // Stop vertical movement on collision
      this.velocity = { ...this.velocity, y: 0 };
    }
  }

  public attack(enemies: readonly Enemy[]): void {
    const now = Date.now();
    if (now - this.lastAttackTime < GAME_CONSTANTS.PLAYER.ATTACK.COOLDOWN) {
      return; // Still on cooldown
    }

    this.lastAttackTime = now;
    this.isAttacking = true;
    this.attackStartTime = now;

    // Get enemies in range and calculate damage
    const stats = this.getStats();
    const hitEnemies = enemies.filter(enemy => this.isInAttackRange(enemy.position));
    
    // Trigger camera shake based on number of enemies hit
    const shakeIntensity = Math.min(3 + hitEnemies.length, 8); // Base shake of 3, up to max of 8
    this.gameEngine.getCamera().shake(shakeIntensity);
    
    // Process damage
    hitEnemies.forEach(enemy => {
      const killed = enemy.takeDamage(stats.attack);
      if (killed) {
        this.gainExperience(enemy.getExperienceReward());
      }
    });
  }

  private isInAttackRange(targetPosition: Position): boolean {
    const centerX = this.position.x + this.size.width / 2;
    const centerY = this.position.y + this.size.height / 2;
    const targetCenterX = targetPosition.x + GAME_CONSTANTS.ENEMIES.GOBLIN.SIZE / 2; // Use smallest enemy size
    const targetCenterY = targetPosition.y + GAME_CONSTANTS.ENEMIES.GOBLIN.SIZE / 2;

    const dx = targetCenterX - centerX;
    const dy = targetCenterY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance <= GAME_CONSTANTS.PLAYER.ATTACK.RANGE;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    // Base sprite rendering
    this.sprite.render(ctx, this.position.x, this.position.y);

    // Render attack animation if attacking
    if (this.isAttacking) {
      const attackProgress = (Date.now() - this.attackStartTime) / GAME_CONSTANTS.PLAYER.ATTACK.ANIMATION_DURATION;
      
      if (attackProgress >= 1) {
        this.isAttacking = false;
      } else {
        this.renderAttackAnimation(ctx, attackProgress);
      }
    }
  }

  private renderAttackAnimation(ctx: CanvasRenderingContext2D, progress: number): void {
    const centerX = this.position.x + this.size.width / 2;
    const centerY = this.position.y + this.size.height / 2;
    const radius = GAME_CONSTANTS.PLAYER.ATTACK.RANGE * progress;

    // Save context state
    ctx.save();

    // Draw attack radius
    ctx.strokeStyle = `rgba(255, 255, 255, ${1 - progress})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Restore context state
    ctx.restore();
  }

  private checkCollision(newX: number, newY: number, level: Level): boolean {
    // Check all corners of the player's bounding box
    const corners = [
      { x: newX, y: newY }, // Top-left
      { x: newX + this.size.width, y: newY }, // Top-right
      { x: newX, y: newY + this.size.height }, // Bottom-left
      { x: newX + this.size.width, y: newY + this.size.height } // Bottom-right
    ];

    return corners.some(corner => level.isWall(corner.x, corner.y));
  }

  private createPlayerSprite(): Sprite {
    const sprite = new Sprite(this.size);
    
    // Get the internal canvas context for more efficient drawing
    const spriteCtx = sprite.context;
    
    // Simple pixel art character - a mini adventurer
    const pixels = [
      '  BBBB  ', // Head (B = Black)
      ' BFFFFB ', // Face (F = Flesh color)
      ' BFFFFB ', // Face
      '  BBBB  ', // Neck
      ' RRRRRR ', // Body (R = Red)
      'RRRRRRRR', // Body
      ' R RR R ', // Legs
      ' B BB B ', // Boots (B = Black)
    ];

    type ColorMap = {
      'B': string;
      'F': string;
      'R': string;
      ' ': string;
    };

    const colors: ColorMap = {
      'B': '#000000', // Black
      'F': '#FFD700', // Flesh tone
      'R': '#FF0000', // Red
      ' ': 'transparent', // Transparent
    };

    pixels.forEach((row, y) => {
      [...row].forEach((pixel, x) => {
        const p = pixel as keyof ColorMap;
        if (p !== ' ') {
          spriteCtx.fillStyle = colors[p];
          // Draw 3x3 pixel blocks for better visibility
          spriteCtx.fillRect(x * 3, y * 3, 3, 3);
        }
      });
    });

    return sprite;
  }

  public getStats(): PlayerStats {
    const equippedStats = this.inventory.getEquippedStats();
    return {
      ...this.stats,
      attack: this.stats.attack + equippedStats.attack,
      defense: this.stats.defense + equippedStats.defense,
      speed: this.stats.speed + equippedStats.speed
    };
  }

  public getInventory(): Inventory {
    return this.inventory;
  }

  public addItem(item: Item, quantity: number = 1): boolean {
    return this.inventory.addItem(item, quantity);
  }

  public removeItem(itemId: string, quantity: number = 1): boolean {
    return this.inventory.removeItem(itemId, quantity);
  }

  public takeDamage(damage: number): boolean {
    const actualDamage = Math.max(1, damage - this.getStats().defense);
    this.stats.health = Math.max(0, this.stats.health - actualDamage);
    return this.stats.health <= 0;
  }

  public heal(amount: number): void {
    this.stats.health = Math.min(this.stats.maxHealth, this.stats.health + amount);
  }

  public restoreMana(amount: number): void {
    this.stats.mana = Math.min(this.stats.maxMana, this.stats.mana + amount);
  }

  public gainExperience(amount: number): boolean {
    this.stats.experience += amount;
    
    if (this.stats.experience >= this.stats.experienceToNext) {
      return this.levelUp();
    }
    
    return false;
  }

  private levelUp(): boolean {
    this.stats.level++;
    this.stats.experience -= this.stats.experienceToNext;
    this.stats.experienceToNext = Math.floor(this.stats.experienceToNext * 1.5);
    
    // Increase stats on level up
    this.stats.maxHealth += 10;
    this.stats.health = this.stats.maxHealth; // Full heal on level up
    this.stats.maxMana += 5;
    this.stats.mana = this.stats.maxMana;
    this.stats.attack += 2;
    this.stats.defense += 1;
    
    return true;
  }

  private giveStartingItems(): void {
    // Give some starting items
    const rustySword = ItemDatabase.getItem('rusty_sword');
    const healthPotion = ItemDatabase.getItem('health_potion');
    const ironOre = ItemDatabase.getItem('iron_ore');
    
    if (rustySword) {
      this.inventory.addItem(rustySword, 1);
    }
    
    if (healthPotion) {
      this.inventory.addItem(healthPotion, 3);
    }
    
    if (ironOre) {
      this.inventory.addItem(ironOre, 5);
    }
  }

  public collectItem(item: Item, quantity: number = 1): boolean {
    const success = this.addItem(item, quantity);
    if (success) {
      // Could trigger UI notification here
      console.log(`Collected ${quantity}x ${item.name}`);
    }
    return success;
  }

  public serialize(): string {
    return JSON.stringify({
      position: this.position,
      stats: this.stats,
      inventory: this.inventory.serialize()
    });
  }

  public deserialize(data: string): void {
    try {
      const parsed = JSON.parse(data);
      
      if (parsed.position) {
        this.position = parsed.position;
      }
      
      if (parsed.stats) {
        this.stats = parsed.stats;
      }
      
      if (parsed.inventory) {
        this.inventory.deserialize(parsed.inventory);
      }
    } catch (error) {
      console.error('Failed to deserialize player:', error);
    }
  }
}

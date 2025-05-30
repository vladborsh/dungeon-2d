import type { 
  GameObject, 
  Position, 
  Size, 
  EnemyStats, 
  EnemyType, 
  EnemyAI 
} from '../../interfaces/gameInterfaces';
import { EnemyState } from '../../interfaces/gameInterfaces';
import type { Level } from '../levels/Level';
import type { Player } from './Player';
import { Sprite } from '../../rendering/sprites/Sprite';
import { GAME_CONSTANTS } from '../../constants/gameConstants';

export abstract class Enemy implements GameObject {
  public position: Position;
  public readonly size: Size;
  protected readonly sprite: Sprite;
  protected stats: EnemyStats;
  protected currentHealth: number;
  protected readonly enemyType: EnemyType;
  protected ai: EnemyAI;
  protected lastAttackTime: number;
  protected isDead: boolean;
  protected level: Level | null;
  protected deathTime: number;

  public constructor(
    position: Position, 
    enemyType: EnemyType, 
    stats: EnemyStats,
    ai: EnemyAI
  ) {
    this.position = position;
    this.enemyType = enemyType;
    this.stats = stats;
    this.currentHealth = stats.maxHealth;
    this.ai = ai;
    this.lastAttackTime = 0;
    this.isDead = false;
    this.level = null;
    this.deathTime = 0;
    
    this.size = this.getEnemySize();
    this.sprite = this.createSprite();
  }

  protected abstract getEnemySize(): Size;
  protected abstract createSprite(): Sprite;
  protected abstract getEnemyColor(): string;

  public setLevel(level: Level): void {
    this.level = level;
  }

  public update(): void {
    if (this.isDead) {
      return;
    }

    // AI will handle movement and state management
    if (this.level) {
      // Note: We'll need to pass player reference through the AI system
      // For now, AI will handle its own logic
    }
  }

  public updateWithPlayerReference(player: Player): void {
    if (this.isDead) {
      return;
    }

    if (this.level && this.ai) {
      this.ai.update(this, player, this.level);
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (this.isDead) {
      return;
    }

    // Render shadow first (behind enemy)
    this.renderShadow(ctx);

    // Render the enemy sprite
    this.sprite.render(ctx, this.position.x, this.position.y);

    // Render health bar above enemy
    this.renderHealthBar(ctx);
  }

  protected renderShadow(ctx: CanvasRenderingContext2D): void {
    const shadowConfig = GAME_CONSTANTS.ENEMIES.RENDERING.SHADOW;
    
    ctx.save();
    
    // Set shadow properties
    ctx.fillStyle = shadowConfig.COLOR;
    
    // Calculate shadow position and size
    const shadowX = this.position.x + shadowConfig.OFFSET_X;
    const shadowY = this.position.y + this.size.height + shadowConfig.OFFSET_Y;
    const shadowWidth = this.size.width * shadowConfig.SCALE_X;
    const shadowHeight = this.size.height * shadowConfig.SCALE_Y;
    
    // Draw elliptical shadow
    ctx.beginPath();
    ctx.ellipse(
      shadowX + shadowWidth / 2,
      shadowY + shadowHeight / 2,
      shadowWidth / 2,
      shadowHeight / 2,
      0, 0, 2 * Math.PI
    );
    ctx.fill();
    
    ctx.restore();
  }

  protected renderHealthBar(ctx: CanvasRenderingContext2D): void {
    if (this.currentHealth >= this.stats.maxHealth) {
      return; // Don't show health bar if at full health
    }

    const barWidth = this.size.width;
    const barHeight = 4;
    const barY = this.position.y - 8;
    const healthPercent = this.currentHealth / this.stats.maxHealth;

    // Background
    ctx.fillStyle = '#333333';
    ctx.fillRect(this.position.x, barY, barWidth, barHeight);

    // Health bar
    ctx.fillStyle = healthPercent > 0.5 ? '#00FF00' : 
                   healthPercent > 0.25 ? '#FFFF00' : '#FF0000';
    ctx.fillRect(this.position.x, barY, barWidth * healthPercent, barHeight);

    // Border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.position.x, barY, barWidth, barHeight);
  }

  public takeDamage(damage: number): boolean {
    if (this.isDead) {
      return false;
    }

    this.currentHealth = Math.max(0, this.currentHealth - damage);
    
    if (this.currentHealth <= 0) {
      this.die();
      return true;
    }
    
    return false;
  }

  protected die(): void {
    this.isDead = true;
    this.deathTime = Date.now();
  }

  public canAttack(targetPosition: Position): boolean {
    if (this.isDead) {
      return false;
    }

    const now = Date.now();
    if (now - this.lastAttackTime < this.stats.attackCooldown) {
      return false;
    }

    const distance = this.getDistanceTo(targetPosition);
    return distance <= this.stats.attackRange;
  }

  public attack(target: Player): boolean {
    if (!this.canAttack(target.position)) {
      return false;
    }

    this.lastAttackTime = Date.now();
    return target.takeDamage(this.stats.damage);
  }

  public getDistanceTo(position: Position): number {
    const dx = this.position.x - position.x;
    const dy = this.position.y - position.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  public canDetectPlayer(playerPosition: Position): boolean {
    if (this.isDead) {
      return false;
    }
    
    const distance = this.getDistanceTo(playerPosition);
    return distance <= this.stats.detectionRadius;
  }

  public moveTowards(targetPosition: Position): void {
    if (this.isDead || !this.level) {
      return;
    }

    const dx = targetPosition.x - this.position.x;
    const dy = targetPosition.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      const normalizedX = dx / distance;
      const normalizedY = dy / distance;

      const newX = this.position.x + normalizedX * this.stats.speed;
      const newY = this.position.y + normalizedY * this.stats.speed;

      // Check collision separately for X and Y axes using bounding box collision
      if (!this.checkCollision(newX, this.position.y)) {
        this.position = { ...this.position, x: newX };
      }

      if (!this.checkCollision(this.position.x, newY)) {
        this.position = { ...this.position, y: newY };
      }
    }
  }

  /**
   * Check collision using bounding box detection (similar to Player class)
   */
  private checkCollision(newX: number, newY: number): boolean {
    if (!this.level) {
      return true;
    }

    // Check all corners of the enemy's bounding box
    const corners = [
      { x: newX, y: newY }, // Top-left
      { x: newX + this.size.width, y: newY }, // Top-right
      { x: newX, y: newY + this.size.height }, // Bottom-left
      { x: newX + this.size.width, y: newY + this.size.height } // Bottom-right
    ];

    return corners.some(corner => this.level!.isWall(corner.x, corner.y));
  }

  public getStats(): EnemyStats {
    return this.stats;
  }

  public getCurrentHealth(): number {
    return this.currentHealth;
  }

  public getType(): EnemyType {
    return this.enemyType;
  }

  public getState(): EnemyState {
    if (this.isDead) {
      return EnemyState.DEAD;
    }
    return this.ai.getState();
  }

  public isAlive(): boolean {
    return !this.isDead;
  }

  public getExperienceReward(): number {
    return this.stats.experienceReward;
  }

  // Method to check if enemy should be removed (e.g., been dead for too long)
  public shouldBeRemoved(): boolean {
    return this.isDead && Date.now() - this.deathTime > 5000; // Remove after 5 seconds
  }
}

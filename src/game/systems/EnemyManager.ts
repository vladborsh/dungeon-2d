import type { Position } from '../../interfaces/gameInterfaces';
import { EnemyType } from '../../interfaces/gameInterfaces';
import type { Level } from '../levels/Level';
import type { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { EnemyGenerator } from './EnemyGenerator';
import { GAME_CONSTANTS } from '../../constants/gameConstants';
import type { GameEngine } from '../../core/GameEngine';

export class EnemyManager {
  private readonly level: Level;
  private readonly enemyGenerator: EnemyGenerator;
  private enemies: Enemy[];
  private lastUpdate: number;

  public constructor(level: Level, gameEngine: GameEngine) {
    this.level = level;
    this.enemyGenerator = new EnemyGenerator(level, gameEngine);
    this.enemies = [];
    this.lastUpdate = Date.now();
  }

  public initializeEnemies(): void {
    this.enemies = this.enemyGenerator.generateDungeonEnemies();
    console.log(`Spawned ${this.enemies.length} enemies in the dungeon`);
  }

  public update(player: Player): void {
    const now = Date.now();
    
    // Update all living enemies
    this.enemies.forEach(enemy => {
      if (enemy.isAlive()) {
        enemy.updateWithPlayerReference(player);
      }
    });

    // Remove dead enemies that should be cleaned up
    this.cleanupDeadEnemies();

    // Handle enemy attacks and interactions with player
    this.handleCombat(player);

    this.lastUpdate = now;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    this.enemies.forEach(enemy => {
      if (enemy.isAlive()) {
        enemy.render(ctx);
      }
    });
  }

  private handleCombat(player: Player): void {
    this.enemies.forEach(enemy => {
      if (!enemy.isAlive()) {
        return;
      }

      // Check if enemy can attack player
      if (enemy.canAttack(player.position)) {
        const playerKilled = enemy.attack(player);
        if (playerKilled) {
          console.log('Player was killed by', enemy.getType());
          // Handle player death
        }
      }
    });
  }

  private cleanupDeadEnemies(): void {
    const beforeCount = this.enemies.length;
    this.enemies = this.enemies.filter(enemy => !enemy.shouldBeRemoved());
    const afterCount = this.enemies.length;
    
    if (beforeCount !== afterCount) {
      console.log(`Cleaned up ${beforeCount - afterCount} dead enemies`);
    }
  }

  public handleEnemyDeath(enemy: Enemy, player: Player): void {
    if (enemy.isAlive()) {
      return;
    }

    // Award experience to player
    const experience = enemy.getExperienceReward();
    const leveledUp = player.gainExperience(experience);
    
    if (leveledUp) {
      console.log(`Player leveled up! New level: ${player.getStats().level}`);
    }
  }

  public getEnemies(): readonly Enemy[] {
    return this.enemies;
  }

  public getEnemiesInRange(position: Position, range: number): Enemy[] {
    return this.enemies.filter(enemy => {
      if (!enemy.isAlive()) {
        return false;
      }
      
      const distance = Math.sqrt(
        Math.pow(enemy.position.x - position.x, 2) +
        Math.pow(enemy.position.y - position.y, 2)
      );
      
      return distance <= range;
    });
  }

  public addEnemy(position: Position, type?: EnemyType, aiType?: string): Enemy | null {
    const enemy = aiType && type 
      ? this.enemyGenerator.createEnemyOfType(type, position, this.enemyGenerator['createAI'](aiType, position))
      : this.enemyGenerator.createRandomEnemy(position);
    
    if (enemy) {
      enemy.setLevel(this.level);
      this.enemies.push(enemy);
      return enemy;
    }
    
    return null;
  }

  public removeEnemy(enemy: Enemy): boolean {
    const index = this.enemies.indexOf(enemy);
    if (index !== -1) {
      this.enemies.splice(index, 1);
      return true;
    }
    return false;
  }

  public getEnemyCount(): number {
    return this.enemies.filter(enemy => enemy.isAlive()).length;
  }

  public getDeadEnemyCount(): number {
    return this.enemies.filter(enemy => !enemy.isAlive()).length;
  }

  public getEnemyStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    
    Object.values(EnemyType).forEach(type => {
      stats[type] = this.enemies.filter(enemy => 
        enemy.isAlive() && enemy.getType() === type
      ).length;
    });
    
    return stats;
  }

  public resetEnemies(): void {
    this.enemies = [];
    this.initializeEnemies();
  }

  // Debug method to get closest enemy to player
  public getClosestEnemyToPlayer(player: Player): Enemy | null {
    let closestEnemy: Enemy | null = null;
    let closestDistance = Infinity;

    this.enemies.forEach(enemy => {
      if (!enemy.isAlive()) {
        return;
      }

      const distance = Math.sqrt(
        Math.pow(enemy.position.x - player.position.x, 2) +
        Math.pow(enemy.position.y - player.position.y, 2)
      );

      if (distance < closestDistance) {
        closestDistance = distance;
        closestEnemy = enemy;
      }
    });

    return closestEnemy;
  }
}

import type { GameObject, Position, EnemyAI } from '../../../interfaces/gameInterfaces';
import { EnemyState } from '../../../interfaces/gameInterfaces';
import type { Level } from '../../levels/Level';
import type { Player } from '../../entities/Player';
import { GAME_CONSTANTS } from '../../../constants/gameConstants';

export class RandomMovementAI implements EnemyAI {
  private state: EnemyState;
  private lastDirectionChange: number;
  private currentDirection: Position;
  private lastMovementCheck: number;

  public constructor() {
    this.state = EnemyState.IDLE;
    this.lastDirectionChange = 0;
    this.currentDirection = { x: 0, y: 0 };
    this.lastMovementCheck = 0;
    this.generateRandomDirection();
  }

  public update(enemy: GameObject, player: GameObject, level: Level): void {
    const now = Date.now();

    // Check if player is detected
    const playerDistance = this.getDistance(enemy.position, player.position);
    const enemyStats = (enemy as any).getStats();
    
    if (playerDistance <= enemyStats.detectionRadius) {
      this.state = EnemyState.CHASING;
      this.chasePlayer(enemy, player, level);
      return;
    }

    // Random movement when not chasing
    this.state = EnemyState.PATROLLING;

    // Change direction periodically
    if (now - this.lastDirectionChange > GAME_CONSTANTS.ENEMIES.AI.RANDOM.DIRECTION_CHANGE_INTERVAL) {
      this.generateRandomDirection();
      this.lastDirectionChange = now;
    }

    // Move in current direction with some probability
    if (now - this.lastMovementCheck > 100) { // Check every 100ms
      if (Math.random() < GAME_CONSTANTS.ENEMIES.AI.RANDOM.MOVEMENT_PROBABILITY) {
        this.moveInDirection(enemy, level);
      }
      this.lastMovementCheck = now;
    }
  }

  private chasePlayer(enemy: GameObject, player: GameObject, level: Level): void {
    const enemyAny = enemy as any;
    
    // Check if can attack
    if (enemyAny.canAttack && enemyAny.canAttack(player.position)) {
      this.state = EnemyState.ATTACKING;
      enemyAny.attack(player);
      return;
    }

    // Move towards player
    if (enemyAny.moveTowards) {
      enemyAny.moveTowards(player.position);
    }
  }

  private generateRandomDirection(): void {
    const angle = Math.random() * Math.PI * 2;
    this.currentDirection = {
      x: Math.cos(angle),
      y: Math.sin(angle)
    };
  }

  private moveInDirection(enemy: GameObject, level: Level): void {
    const enemyAny = enemy as any;
    const stats = enemyAny.getStats();
    
    // Calculate target position based on current direction
    const targetX = enemy.position.x + this.currentDirection.x * stats.speed * 2; // Multiply by 2 for smoother movement
    const targetY = enemy.position.y + this.currentDirection.y * stats.speed * 2;
    
    const targetPosition = { x: targetX, y: targetY };
    
    // Store old position to check if movement was successful
    const oldPosition = { ...enemy.position };
    
    // Use the enemy's moveTowards method which has proper collision detection
    if (enemyAny.moveTowards) {
      enemyAny.moveTowards(targetPosition);
    }
    
    // Check if movement was blocked and change direction if needed
    const moved = (Math.abs(enemy.position.x - oldPosition.x) > 0.1 || 
                  Math.abs(enemy.position.y - oldPosition.y) > 0.1);
    
    if (!moved) {
      // Hit a wall, reverse direction or pick a new random direction
      if (Math.random() < 0.5) {
        // Reverse direction
        this.currentDirection.x *= -1;
        this.currentDirection.y *= -1;
      } else {
        // Pick a completely new random direction
        this.generateRandomDirection();
      }
    }
  }

  private getDistance(pos1: Position, pos2: Position): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  public getState(): EnemyState {
    return this.state;
  }

  public reset(): void {
    this.state = EnemyState.IDLE;
    this.generateRandomDirection();
    this.lastDirectionChange = 0;
    this.lastMovementCheck = 0;
  }
}

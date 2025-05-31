import type { Position, EnemyAI } from '../../../interfaces/gameInterfaces';
import { EnemyState } from '../../../interfaces/gameInterfaces';
import type { Level } from '../../levels/Level';
import type { Player } from '../../entities/Player';
import type { Enemy } from '../../entities/Enemy';

export class GuardAI implements EnemyAI {
  private state: EnemyState;
  private originalPosition: Position;
  private maxGuardDistance: number;

  public constructor(position: Position, guardDistance: number = 50) {
    this.state = EnemyState.IDLE;
    this.originalPosition = { ...position };
    this.maxGuardDistance = guardDistance;
  }

  public update(enemy: Enemy, player: Player, level: Level): void {
    const playerDistance = this.getDistance(enemy.position, player.position);
    const enemyStats = enemy.getStats();
    const distanceFromOriginal = this.getDistance(enemy.position, this.originalPosition);

    // Check if player is detected and within guard range
    if (playerDistance <= enemyStats.detectionRadius && 
        this.getDistance(player.position, this.originalPosition) <= this.maxGuardDistance) {
      this.state = EnemyState.CHASING;
      this.chasePlayer(enemy, player, level);
      return;
    }

    // Return to original position if too far away
    if (distanceFromOriginal > 20) {
      this.state = EnemyState.PATROLLING;
      enemy.moveTowards(this.originalPosition);
      return;
    }

    // Stay idle at guard position
    this.state = EnemyState.IDLE;
  }

  private chasePlayer(enemy: Enemy, player: Player, level: Level): void {
    // Check if can attack
    if (enemy.canAttack(player.position)) {
      this.state = EnemyState.ATTACKING;
      enemy.attack(player);
      return;
    }

    // Only chase if player is within guard area
    const playerDistanceFromGuard = this.getDistance(player.position, this.originalPosition);
    if (playerDistanceFromGuard <= this.maxGuardDistance) {
      // Move towards player
      enemy.moveTowards(player.position);
    } else {
      // Player left guard area, return to position
      this.state = EnemyState.PATROLLING;
      enemy.moveTowards(this.originalPosition);
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
  }
}

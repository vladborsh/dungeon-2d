import type { Position, EnemyAI } from '../../../interfaces/gameInterfaces';
import { EnemyState } from '../../../interfaces/gameInterfaces';
import type { Level } from '../../levels/Level';
import type { Player } from '../../entities/Player';
import type { Enemy } from '../../entities/Enemy';

export class AggressiveAI implements EnemyAI {
  private state: EnemyState;
  private lastPlayerPosition: Position | null;
  private searchTime: number;
  private maxSearchTime: number;

  public constructor() {
    this.state = EnemyState.IDLE;
    this.lastPlayerPosition = null;
    this.searchTime = 0;
    this.maxSearchTime = 5000; // Search for 5 seconds
  }

  public update(enemy: Enemy, player: Player, level: Level): void {
    const playerDistance = this.getDistance(enemy.position, player.position);
    const enemyStats = enemy.getStats();

    // Always chase if player is detected
    if (playerDistance <= enemyStats.detectionRadius) {
      this.state = EnemyState.CHASING;
      this.lastPlayerPosition = { ...player.position };
      this.searchTime = 0;
      this.chasePlayer(enemy, player, level);
      return;
    }

    // Continue searching for player at last known position
    if (this.lastPlayerPosition && this.searchTime < this.maxSearchTime) {
      this.state = EnemyState.CHASING;
      this.searchTime += 16; // Approximate frame time
      enemy.moveTowards(this.lastPlayerPosition);

      // Stop searching if reached last known position
      const distanceToLastPos = this.getDistance(enemy.position, this.lastPlayerPosition);
      if (distanceToLastPos < 20) {
        this.lastPlayerPosition = null;
        this.searchTime = 0;
      }
      return;
    }

    // Lost player, return to idle/patrol
    this.state = EnemyState.IDLE;
    this.lastPlayerPosition = null;
    this.searchTime = 0;
  }

  private chasePlayer(enemy: Enemy, player: Player, level: Level): void {
    // Check if can attack
    if (enemy.canAttack(player.position)) {
      this.state = EnemyState.ATTACKING;
      enemy.attack(player);
      return;
    }

    // Move towards player aggressively
    enemy.moveTowards(player.position);
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
    this.lastPlayerPosition = null;
    this.searchTime = 0;
  }
}

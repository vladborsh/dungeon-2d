import type { GameObject, Position, EnemyAI } from '../../../interfaces/gameInterfaces';
import { EnemyState } from '../../../interfaces/gameInterfaces';
import type { Level } from '../../levels/Level';
import type { Player } from '../../entities/Player';
import { GAME_CONSTANTS } from '../../../constants/gameConstants';

export class PatrolAI implements EnemyAI {
  private state: EnemyState;
  private patrolPoints: Position[];
  private currentPatrolIndex: number;
  private waitStartTime: number;
  private isWaiting: boolean;
  private originalPosition: Position;

  public constructor(centerPosition: Position) {
    this.state = EnemyState.PATROLLING;
    this.currentPatrolIndex = 0;
    this.waitStartTime = 0;
    this.isWaiting = false;
    this.originalPosition = { ...centerPosition };
    this.patrolPoints = this.generatePatrolPoints(centerPosition);
  }

  public update(enemy: GameObject, player: GameObject, level: Level): void {
    // Check if player is detected first
    const playerDistance = this.getDistance(enemy.position, player.position);
    const enemyStats = (enemy as any).getStats();
    
    if (playerDistance <= enemyStats.detectionRadius) {
      this.state = EnemyState.CHASING;
      this.chasePlayer(enemy, player, level);
      return;
    }

    // Resume patrolling if player is no longer detected
    if (this.state === EnemyState.CHASING) {
      this.state = EnemyState.PATROLLING;
      this.isWaiting = false;
    }

    this.patrol(enemy, level);
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

  private patrol(enemy: GameObject, level: Level): void {
    if (this.isWaiting) {
      const now = Date.now();
      if (now - this.waitStartTime >= GAME_CONSTANTS.ENEMIES.AI.PATROL.WAIT_TIME) {
        this.isWaiting = false;
        this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length;
      }
      return;
    }

    const targetPoint = this.patrolPoints[this.currentPatrolIndex];
    const distance = this.getDistance(enemy.position, targetPoint);

    if (distance < 10) { // Reached patrol point
      this.isWaiting = true;
      this.waitStartTime = Date.now();
      this.state = EnemyState.IDLE;
    } else {
      this.state = EnemyState.PATROLLING;
      const enemyAny = enemy as any;
      if (enemyAny.moveTowards) {
        enemyAny.moveTowards(targetPoint);
      }
    }
  }

  private generatePatrolPoints(center: Position): Position[] {
    const points: Position[] = [];
    const radius = GAME_CONSTANTS.ENEMIES.AI.PATROL.PATROL_RADIUS;
    const count = GAME_CONSTANTS.ENEMIES.AI.PATROL.POINT_COUNT;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const offsetX = Math.cos(angle) * radius * (0.5 + Math.random() * 0.5);
      const offsetY = Math.sin(angle) * radius * (0.5 + Math.random() * 0.5);
      
      points.push({
        x: center.x + offsetX,
        y: center.y + offsetY
      });
    }

    return points;
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
    this.state = EnemyState.PATROLLING;
    this.currentPatrolIndex = 0;
    this.isWaiting = false;
    this.waitStartTime = 0;
    this.patrolPoints = this.generatePatrolPoints(this.originalPosition);
  }
}

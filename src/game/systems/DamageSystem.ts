import type { Position, Size } from '../../interfaces/gameInterfaces';
import type { GameEngine } from '../../core/GameEngine';
import { ParticleType } from '../../rendering/effects/ParticleSystem';

export interface DamageResult {
  damage: number;
  killed: boolean;
}

export class DamageSystem {
  private readonly gameEngine: GameEngine;

  public constructor(gameEngine: GameEngine) {
    this.gameEngine = gameEngine;
  }

  public processPlayerAttack(
    attackerPosition: Position,
    attackerSize: Size,
    targetPosition: Position,
    targetSize: Size,
    damage: number
  ): void {
    // Calculate angle between attacker and target for hit particles
    const dx = targetPosition.x - attackerPosition.x;
    const dy = targetPosition.y - attackerPosition.y;
    const angle = Math.atan2(dy, dx);

    // Create particles at the point of impact
    const impactPoint = {
      x: targetPosition.x + targetSize.width / 2 - Math.cos(angle) * targetSize.width / 2,
      y: targetPosition.y + targetSize.height / 2 - Math.sin(angle) * targetSize.height / 2
    };

    // Create particles on hit
    this.gameEngine.getParticleSystem().emitParticles({
      position: impactPoint,
      particleCount: 8,
      particleLifetime: 20,
      particleSize: 3,
      particleColor: '#FFD700', // Golden particles for player attacks
      velocityRange: {
        minX: Math.cos(angle) * 2 - 1,
        maxX: Math.cos(angle) * 2 + 1,
        minY: Math.sin(angle) * 2 - 1,
        maxY: Math.sin(angle) * 2 + 1
      },
      gravity: 0.1,
      decay: 0.05,
      type: ParticleType.PLAYER_ATTACK
    });
  }

  public processEnemyAttack(
    attackerPosition: Position,
    attackerSize: Size,
    targetPosition: Position,
    targetSize: Size,
    attackColor: string
  ): void {
    // Calculate angle between attacker and target for hit particles
    const dx = targetPosition.x - attackerPosition.x;
    const dy = targetPosition.y - attackerPosition.y;
    const angle = Math.atan2(dy, dx);

    // Create particles at the point of impact
    const impactPoint = {
      x: targetPosition.x + targetSize.width / 2 - Math.cos(angle) * targetSize.width / 2,
      y: targetPosition.y + targetSize.height / 2 - Math.sin(angle) * targetSize.height / 2
    };

    // Configure particle emission
    this.gameEngine.getParticleSystem().emitParticles({
      position: impactPoint,
      particleCount: 8,
      particleLifetime: 20,
      particleSize: 2,
      particleColor: attackColor,
      velocityRange: {
        minX: -Math.cos(angle) * 2 - 1,
        maxX: -Math.cos(angle) * 2 + 1,
        minY: -Math.sin(angle) * 2 - 1,
        maxY: -Math.sin(angle) * 2 + 1
      },
      gravity: 0.1,
      decay: 0.05,
      type: ParticleType.ENEMY_ATTACK
    });
  }
}

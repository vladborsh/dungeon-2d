import { Player } from '../entities/Player';
import { ParticleSystem } from '../../rendering/effects/ParticleSystem';
import { GAME_CONSTANTS } from '../../constants/gameConstants';

export class PlayerTrailSystem {
  private previousPlayerPosition: { x: number; y: number } | null = null;

  constructor(
    private readonly player: Player,
    private readonly particleSystem: ParticleSystem
  ) {}

  public update(): void {
    if (!this.player) return;

    const currentPosition = {
      x: this.player.position.x + this.player.size.width / 2,
      y: this.player.position.y + this.player.size.height / 2
    };

    // Check if player is moving
    if (this.previousPlayerPosition) {
      const deltaX = currentPosition.x - this.previousPlayerPosition.x;
      const deltaY = currentPosition.y - this.previousPlayerPosition.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Only generate trail if player is moving fast enough
      if (distance > 1) {
        // Generate multiple trail particles per frame when moving
        for (let i = 0; i < GAME_CONSTANTS.PARTICLES.TRAIL.SPAWN_RATE; i++) {
          this.particleSystem.createTrailParticle({
            x: currentPosition.x + (Math.random() - 0.5) * this.player.size.width,
            y: currentPosition.y + (Math.random() - 0.5) * this.player.size.height
          });
        }
      }
    }

    this.previousPlayerPosition = { ...currentPosition };
  }
}

import type { Position } from '../../interfaces/gameInterfaces';

export interface Particle {
  readonly id: number;
  position: Position;
  velocity: Position;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  gravity?: number;
  decay?: number;
  type: ParticleType;
}

export enum ParticleType {
  TRAIL = 'trail',
  EXPLOSION = 'explosion'
}

export interface ParticleEmitterConfig {
  readonly position: Position;
  readonly particleCount: number;
  readonly particleLifetime: number;
  readonly particleSize: number;
  readonly particleColor: string;
  readonly velocityRange: {
    readonly minX: number;
    readonly maxX: number;
    readonly minY: number;
    readonly maxY: number;
  };
  readonly gravity?: number;
  readonly decay?: number;
  readonly type: ParticleType;
}

export class ParticleSystem {
  private readonly particles: Map<number, Particle>;
  private nextParticleId: number;

  public constructor() {
    this.particles = new Map();
    this.nextParticleId = 0;
  }

  public createTrailParticle(position: Position): void {
    const particle: Particle = {
      id: this.nextParticleId++,
      position: { x: position.x, y: position.y },
      velocity: { 
        x: (Math.random() - 0.5) * 2, 
        y: (Math.random() - 0.5) * 2 
      },
      size: Math.random() * 1.5 + 0.5, // Smaller particles: 0.5 to 2.0
      color: '#FFD700', // Golden color for trail
      alpha: 0.8,
      life: 30, // Frames
      maxLife: 30,
      decay: 0.03,
      type: ParticleType.TRAIL
    };

    this.particles.set(particle.id, particle);
  }

  public createExplosionParticles(position: Position, count: number = 8): void {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = Math.random() * 4 + 2;
      
      const particle: Particle = {
        id: this.nextParticleId++,
        position: { 
          x: position.x + (Math.random() - 0.5) * 8, 
          y: position.y + (Math.random() - 0.5) * 8 
        },
        velocity: { 
          x: Math.cos(angle) * speed, 
          y: Math.sin(angle) * speed 
        },
        size: Math.random() * 4 + 2,
        color: this.getRandomExplosionColor(),
        alpha: 1.0,
        life: 45, // Frames
        maxLife: 45,
        gravity: 0.1,
        decay: 0.02,
        type: ParticleType.EXPLOSION
      };

      this.particles.set(particle.id, particle);
    }
  }

  public emitParticles(config: ParticleEmitterConfig): void {
    for (let i = 0; i < config.particleCount; i++) {
      const particle: Particle = {
        id: this.nextParticleId++,
        position: { x: config.position.x, y: config.position.y },
        velocity: {
          x: Math.random() * (config.velocityRange.maxX - config.velocityRange.minX) + config.velocityRange.minX,
          y: Math.random() * (config.velocityRange.maxY - config.velocityRange.minY) + config.velocityRange.minY
        },
        size: config.particleSize + Math.random() * 2,
        color: config.particleColor,
        alpha: 1.0,
        life: config.particleLifetime,
        maxLife: config.particleLifetime,
        gravity: config.gravity,
        decay: config.decay,
        type: config.type
      };

      this.particles.set(particle.id, particle);
    }
  }

  public update(): void {
    const particlesToRemove: number[] = [];

    for (const [id, particle] of this.particles) {
      // Update position
      particle.position.x += particle.velocity.x;
      particle.position.y += particle.velocity.y;

      // Apply gravity if present
      if (particle.gravity !== undefined) {
        particle.velocity.y += particle.gravity;
      }

      // Apply decay to velocity if present
      if (particle.decay !== undefined) {
        particle.velocity.x *= (1 - particle.decay);
        particle.velocity.y *= (1 - particle.decay);
      }

      // Update life and alpha
      particle.life--;
      particle.alpha = Math.max(0, particle.life / particle.maxLife);

      // Remove dead particles
      if (particle.life <= 0) {
        particlesToRemove.push(id);
      }
    }

    // Remove dead particles
    for (const id of particlesToRemove) {
      this.particles.delete(id);
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    for (const particle of this.particles.values()) {
      ctx.globalAlpha = particle.alpha;
      ctx.fillStyle = particle.color;
      
      // Draw square particle
      ctx.fillRect(
        Math.round(particle.position.x - particle.size / 2),
        Math.round(particle.position.y - particle.size / 2),
        particle.size,
        particle.size
      );
    }

    ctx.restore();
  }

  public getParticleCount(): number {
    return this.particles.size;
  }

  public clear(): void {
    this.particles.clear();
  }

  private getRandomExplosionColor(): string {
    const colors = [
      '#FFD700', // Gold
      '#FF6B35', // Orange
      '#F7931E', // Bright orange
      '#FFEB3B', // Yellow
      '#FF9800', // Amber
      '#FFC107'  // Light amber
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

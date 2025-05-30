import type { GameObject, Position, Size } from '../../interfaces/gameInterfaces';
import type { Level } from '../levels/Level';
import type { InputManager } from '../../core/InputManager';
import { Sprite } from '../../rendering/sprites/Sprite';
import { GAME_CONSTANTS } from '../../constants/gameConstants';

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

  public constructor(position: Position) {
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

  public render(ctx: CanvasRenderingContext2D): void {
    this.sprite.render(ctx, this.position.x, this.position.y);
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
          // Draw 2x2 pixel blocks for better visibility
          spriteCtx.fillRect(x * 2, y * 2, 2, 2);
        }
      });
    });

    return sprite;
  }
}

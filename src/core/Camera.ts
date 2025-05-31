import type { Position } from '../interfaces/gameInterfaces';
import { GAME_CONSTANTS } from '../constants/gameConstants';

/**
 * Camera system that follows the player and handles viewport transformations
 */
export class Camera {
  private position: Position;
  private readonly viewportWidth: number;
  private readonly viewportHeight: number;
  private readonly smoothingFactor: number;
  private targetPosition: Position;
  private shakeIntensity: number = 0;
  private shakeDecay: number = 0.9;
  private shakeOffset: Position = { x: 0, y: 0 };

  public constructor() {
    this.position = { x: 0, y: 0 };
    this.targetPosition = { x: 0, y: 0 };
    this.viewportWidth = GAME_CONSTANTS.CANVAS.WIDTH;
    this.viewportHeight = GAME_CONSTANTS.CANVAS.HEIGHT;
    this.smoothingFactor = GAME_CONSTANTS.CAMERA.SMOOTHING_FACTOR;
  }

  /**
   * Trigger a camera shake effect
   * @param intensity Initial shake intensity in pixels
   */
  public shake(intensity: number): void {
    this.shakeIntensity = intensity;
  }

  /**
   * Update camera position to follow the target (usually the player)
   */
  public update(targetPosition: Position): void {
    // Calculate the center position for the camera based on the target
    this.targetPosition = {
      x: targetPosition.x - this.viewportWidth / 2,
      y: targetPosition.y - this.viewportHeight / 2
    };

    // Apply smooth camera movement using linear interpolation
    this.position = {
      x: this.position.x + (this.targetPosition.x - this.position.x) * this.smoothingFactor,
      y: this.position.y + (this.targetPosition.y - this.position.y) * this.smoothingFactor
    };

    // Update shake effect
    if (this.shakeIntensity > 0) {
      this.shakeOffset = {
        x: (Math.random() * 2 - 1) * this.shakeIntensity,
        y: (Math.random() * 2 - 1) * this.shakeIntensity
      };
      this.shakeIntensity *= this.shakeDecay;
      
      if (this.shakeIntensity < 0.1) {
        this.shakeIntensity = 0;
        this.shakeOffset = { x: 0, y: 0 };
      }
    }
  }

  /**
   * Apply camera transformation to the canvas context
   */
  public apply(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(
      -Math.round(this.position.x + this.shakeOffset.x), 
      -Math.round(this.position.y + this.shakeOffset.y)
    );
  }

  /**
   * Remove camera transformation from the canvas context
   */
  public restore(ctx: CanvasRenderingContext2D): void {
    ctx.restore();
  }

  /**
   * Get the current camera position
   */
  public getPosition(): Position {
    return { ...this.position };
  }

  /**
   * Convert screen coordinates to world coordinates
   */
  public screenToWorld(screenPos: Position): Position {
    return {
      x: screenPos.x + this.position.x,
      y: screenPos.y + this.position.y
    };
  }

  /**
   * Convert world coordinates to screen coordinates
   */
  public worldToScreen(worldPos: Position): Position {
    return {
      x: worldPos.x - this.position.x,
      y: worldPos.y - this.position.y
    };
  }

  /**
   * Check if a world position is visible in the current viewport
   */
  public isVisible(worldPos: Position, objectSize: { width: number; height: number }): boolean {
    const screenPos = this.worldToScreen(worldPos);
    return (
      screenPos.x + objectSize.width >= 0 &&
      screenPos.x <= this.viewportWidth &&
      screenPos.y + objectSize.height >= 0 &&
      screenPos.y <= this.viewportHeight
    );
  }

  /**
   * Get the current viewport bounds in world coordinates
   */
  public getViewportBounds(): {
    left: number;
    right: number;
    top: number;
    bottom: number;
  } {
    return {
      left: this.position.x,
      right: this.position.x + this.viewportWidth,
      top: this.position.y,
      bottom: this.position.y + this.viewportHeight
    };
  }
}

import { Position, Size } from '../../interfaces/gameInterfaces';
import { Player } from '../../game/entities/Player';
import { Camera } from '../../core/Camera';
import { GAME_CONSTANTS } from '../../constants/gameConstants';

export class FogOfWar {
  private readonly fogCanvas: HTMLCanvasElement;
  private readonly fogCtx: CanvasRenderingContext2D;
  private readonly tileSize: number;
  private readonly visibilityRadius: number;

  constructor() {
    // Create a separate canvas for fog rendering
    this.fogCanvas = document.createElement('canvas');
    this.fogCanvas.width = GAME_CONSTANTS.CANVAS.WIDTH;
    this.fogCanvas.height = GAME_CONSTANTS.CANVAS.HEIGHT;

    const ctx = this.fogCanvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context for fog canvas');
    }
    this.fogCtx = ctx;

    // Initialize from constants
    this.tileSize = GAME_CONSTANTS.FOG_OF_WAR.TILE_SIZE;
    this.visibilityRadius = GAME_CONSTANTS.FOG_OF_WAR.VISIBILITY_RADIUS;

    // Disable image smoothing for pixelated effect
    this.fogCtx.imageSmoothingEnabled = false;
  }

  private updateFogCanvas(playerPosition: Position, camera: Camera): void {
    const viewportBounds = camera.getViewportBounds();
    
    // Clear the fog canvas
    this.fogCtx.fillStyle = GAME_CONSTANTS.FOG_OF_WAR.FOG_COLOR;
    this.fogCtx.fillRect(0, 0, this.fogCanvas.width, this.fogCanvas.height);

    // Convert player world position to screen position
    const playerScreen = camera.worldToScreen(playerPosition);

    // Create circular gradient for visibility
    const gradient = this.fogCtx.createRadialGradient(
      playerScreen.x, playerScreen.y,
      0,
      playerScreen.x, playerScreen.y,
      this.visibilityRadius
    );

    const { INNER, MIDDLE, OUTER } = GAME_CONSTANTS.FOG_OF_WAR.GRADIENT_STOPS;
    gradient.addColorStop(INNER.POSITION, INNER.COLOR);
    gradient.addColorStop(MIDDLE.POSITION, MIDDLE.COLOR);
    gradient.addColorStop(OUTER.POSITION, OUTER.COLOR);

    // Create grid of tiles for pixelated effect
    this.fogCtx.save();
    // Use 'destination-out' to cut holes in the fog
    this.fogCtx.globalCompositeOperation = 'destination-out';
    
    // Calculate the visible area in tiles
    const startX = Math.floor((playerScreen.x - this.visibilityRadius) / this.tileSize) * this.tileSize;
    const startY = Math.floor((playerScreen.y - this.visibilityRadius) / this.tileSize) * this.tileSize;
    const endX = Math.ceil((playerScreen.x + this.visibilityRadius) / this.tileSize) * this.tileSize;
    const endY = Math.ceil((playerScreen.y + this.visibilityRadius) / this.tileSize) * this.tileSize;

    for (let y = startY; y <= endY; y += this.tileSize) {
      for (let x = startX; x <= endX; x += this.tileSize) {
        const distX = x + this.tileSize / 2 - playerScreen.x;
        const distY = y + this.tileSize / 2 - playerScreen.y;
        const distance = Math.sqrt(distX * distX + distY * distY);
        
        if (distance < this.visibilityRadius) {
          // Calculate tile visibility based on distance using exponential falloff
          // This creates a sharper transition from visible to foggy areas
          const normalizedDistance = distance / this.visibilityRadius;
          const visibility = Math.pow(1 - normalizedDistance, GAME_CONSTANTS.FOG_OF_WAR.EXPONENTIAL_FACTOR);
          this.fogCtx.fillStyle = `rgba(0, 0, 0, ${visibility})`;
          this.fogCtx.fillRect(x, y, this.tileSize, this.tileSize);
        }
      }
    }
    
    this.fogCtx.restore();
  }

  public render(ctx: CanvasRenderingContext2D, player: Player, camera: Camera): void {
    // Update the fog canvas based on player position
    this.updateFogCanvas(player.position, camera);

    // Draw fog over the game scene
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(this.fogCanvas, 0, 0);
    ctx.restore();
  }
}

import { GAME_CONSTANTS } from '../constants/gameConstants';
import { Sprite } from './sprites/Sprite';

interface TileInfo {
  readonly spriteIndex: number;
  readonly x: number;
  readonly y: number;
}

export class Scene {
  private readonly floorSprites: Sprite[] = [];
  private readonly tileLayout: TileInfo[] = [];

  public constructor() {
    this.createFloorTiles();
    this.generateTileLayout();
  }

  public render(ctx: CanvasRenderingContext2D): void {
    // Render pre-calculated floor tiles
    for (const tile of this.tileLayout) {
      this.floorSprites[tile.spriteIndex].render(ctx, tile.x, tile.y);
    }
  }

  private createFloorTiles(): void {
    const tileSize = GAME_CONSTANTS.TILE_SIZE;
    const size = { width: tileSize, height: tileSize };

    // Create a few variations of floor tiles
    for (let i = 0; i < 3; i++) {
      const sprite = new Sprite(size);
      const baseColor = GAME_CONSTANTS.COLORS.FLOOR;
      const variation = i * 10;
      
      // Fill the tile with base color and add some noise
      for (let y = 0; y < tileSize; y++) {
        for (let x = 0; x < tileSize; x++) {
          const shade = Math.floor(Math.random() * variation);
          const color = this.adjustColor(baseColor, shade);
          sprite.setPixel(x, y, color);
        }
      }

      this.floorSprites.push(sprite);
    }
  }

  private generateTileLayout(): void {
    const tileSize = GAME_CONSTANTS.TILE_SIZE;
    
    for (let y = 0; y < GAME_CONSTANTS.CANVAS.HEIGHT; y += tileSize) {
      for (let x = 0; x < GAME_CONSTANTS.CANVAS.WIDTH; x += tileSize) {
        const spriteIndex = Math.floor(Math.random() * this.floorSprites.length);
        this.tileLayout.push({ spriteIndex, x, y });
      }
    }
  }

  private adjustColor(color: string, adjustment: number): string {
    const hex = color.slice(1);
    const num = parseInt(hex, 16);
    const r = Math.min(255, ((num >> 16) & 255) + adjustment);
    const g = Math.min(255, ((num >> 8) & 255) + adjustment);
    const b = Math.min(255, (num & 255) + adjustment);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }
}

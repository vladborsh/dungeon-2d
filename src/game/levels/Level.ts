import { GAME_CONSTANTS } from '../../constants/gameConstants';
import { Cell, CellType } from './MazeCell';
import { MazeGenerator } from './MazeGenerator';
import { Sprite } from '../../rendering/sprites/Sprite';
import type { Position } from '../../interfaces/gameInterfaces';

export class Level {
  private readonly maze: Cell[][];
  private readonly wallSprite: Sprite;
  private readonly pathSprite: Sprite;
  private readonly roomSprite: Sprite;
  private readonly roomWallSprite: Sprite;
  private readonly wallShadowSprite: Sprite;

  public constructor() {
    const mazeWidth = Math.floor((GAME_CONSTANTS.CANVAS.WIDTH * GAME_CONSTANTS.MAZE.SIZE_MULTIPLIER) / GAME_CONSTANTS.TILE_SIZE);
    const mazeHeight = Math.floor((GAME_CONSTANTS.CANVAS.HEIGHT * GAME_CONSTANTS.MAZE.SIZE_MULTIPLIER) / GAME_CONSTANTS.TILE_SIZE);
    
    const generator = new MazeGenerator(mazeWidth, mazeHeight);
    this.maze = generator.generate();

    this.wallSprite = this.createSprite(GAME_CONSTANTS.COLORS.WALL);
    this.pathSprite = this.createSprite(GAME_CONSTANTS.COLORS.FLOOR);
    this.roomSprite = this.createSprite(GAME_CONSTANTS.COLORS.ROOM);
    this.roomWallSprite = this.createSprite(GAME_CONSTANTS.COLORS.ROOM_WALL);
    this.wallShadowSprite = this.createShadowSprite();
  }

  public render(ctx: CanvasRenderingContext2D): void {
    this.renderFloorAndObjects(ctx);
  }

  public renderWalls(ctx: CanvasRenderingContext2D): void {
    const tileSize = GAME_CONSTANTS.TILE_SIZE;
    const shadowConfig = GAME_CONSTANTS.ENEMIES.RENDERING.SHADOW;
    const shadowOffsetX = shadowConfig.OFFSET.LARGE.X;
    const shadowOffsetY = shadowConfig.OFFSET.LARGE.Y;
    const scaleX = shadowConfig.SCALE.LARGE.X;
    const scaleY = shadowConfig.SCALE.LARGE.Y;

    // First loop: render all shadows
    for (let y = 0; y < this.maze.length; y++) {
      for (let x = 0; x < this.maze[y].length; x++) {
        const cell = this.maze[y][x];
        if (cell.type === CellType.Wall || cell.type === CellType.RoomWall) {
          const screenX = x * tileSize;
          const screenY = y * tileSize;
          const shadowX = screenX + shadowOffsetX - (tileSize * scaleX / 2);
          const shadowY = screenY + shadowOffsetY - (tileSize * scaleY / 2);
          this.wallShadowSprite.render(ctx, shadowX, shadowY);
        }
      }
    }

    // Second loop: render all walls
    for (let y = 0; y < this.maze.length; y++) {
      for (let x = 0; x < this.maze[y].length; x++) {
        const cell = this.maze[y][x];
        if (cell.type === CellType.Wall || cell.type === CellType.RoomWall) {
          const screenX = x * tileSize;
          const screenY = y * tileSize;
          if (cell.type === CellType.Wall) {
            this.wallSprite.render(ctx, screenX, screenY);
          } else {
            this.roomWallSprite.render(ctx, screenX, screenY);
          }
        }
      }
    }
  }

  public renderFloorAndObjects(ctx: CanvasRenderingContext2D): void {
    const tileSize = GAME_CONSTANTS.TILE_SIZE;

    for (let y = 0; y < this.maze.length; y++) {
      for (let x = 0; x < this.maze[y].length; x++) {
        const cell = this.maze[y][x];
        const screenX = x * tileSize;
        const screenY = y * tileSize;

        switch (cell.type) {
          case CellType.Path:
          case CellType.Start:
          case CellType.End:
            this.pathSprite.render(ctx, screenX, screenY);
            break;
          case CellType.Room:
            this.roomSprite.render(ctx, screenX, screenY);
            break;
        }
      }
    }
  }

  public getStartPosition(): Position {
    for (let y = 0; y < this.maze.length; y++) {
      for (let x = 0; x < this.maze[y].length; x++) {
        if (this.maze[y][x].type === CellType.Start) {
          return {
            x: x * GAME_CONSTANTS.TILE_SIZE,
            y: y * GAME_CONSTANTS.TILE_SIZE,
          };
        }
      }
    }
    throw new Error('Start position not found in maze');
  }

  public isWall(x: number, y: number): boolean {
    const tileX = Math.floor(x / GAME_CONSTANTS.TILE_SIZE);
    const tileY = Math.floor(y / GAME_CONSTANTS.TILE_SIZE);

    if (
      tileX < 0 ||
      tileY < 0 ||
      tileY >= this.maze.length ||
      tileX >= this.maze[0].length
    ) {
      return true;
    }

    const cellType = this.maze[tileY][tileX].type;
    return cellType === CellType.Wall || cellType === CellType.RoomWall;
  }

  /**
   * Get the cell type at maze coordinates (not pixel coordinates)
   */
  public getCellType(tileX: number, tileY: number): CellType {
    if (
      tileX < 0 ||
      tileY < 0 ||
      tileY >= this.maze.length ||
      tileX >= this.maze[0].length
    ) {
      return CellType.Wall;
    }

    return this.maze[tileY][tileX].type;
  }

  /**
   * Check if a pixel position is walkable (not a wall)
   */
  public isWalkable(x: number, y: number): boolean {
    return !this.isWall(x, y);
  }

  /**
   * Check if tile coordinates are walkable
   */
  public isTileWalkable(tileX: number, tileY: number): boolean {
    const cellType = this.getCellType(tileX, tileY);
    return cellType === CellType.Path || 
           cellType === CellType.Room || 
           cellType === CellType.Start || 
           cellType === CellType.End;
  }

  private createSprite(color: string): Sprite {
    const sprite = new Sprite({
      width: GAME_CONSTANTS.TILE_SIZE,
      height: GAME_CONSTANTS.TILE_SIZE,
    });

    // Use fillRect instead of pixel-by-pixel for better performance
    const spriteCtx = sprite.context;
    spriteCtx.fillStyle = color;
    spriteCtx.fillRect(0, 0, GAME_CONSTANTS.TILE_SIZE, GAME_CONSTANTS.TILE_SIZE);

    return sprite;
  }

  private createShadowSprite(): Sprite {
    // Create a larger sprite for the shadow based on medium scaling factors
    const scaleX = GAME_CONSTANTS.ENEMIES.RENDERING.SHADOW.SCALE.MEDIUM.X;
    const scaleY = GAME_CONSTANTS.ENEMIES.RENDERING.SHADOW.SCALE.MEDIUM.Y;
    const tileSize = GAME_CONSTANTS.TILE_SIZE;
    
    const sprite = new Sprite({
      width: tileSize, 
      height: tileSize, 
    });

    const spriteCtx = sprite.context;
    spriteCtx.fillStyle = GAME_CONSTANTS.ENEMIES.RENDERING.SHADOW.COLOR;
    spriteCtx.fillRect(0, 0, sprite.context.canvas.width, sprite.context.canvas.height);

    return sprite;
  }
}

export default Level;

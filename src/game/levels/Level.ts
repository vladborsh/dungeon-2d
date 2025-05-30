import { GAME_CONSTANTS } from '../../constants/gameConstants';
import { Cell, CellType } from './MazeCell';
import { MazeGenerator } from './MazeGenerator';
import { Sprite } from '../../rendering/sprites/Sprite';
import type { Position } from '../../interfaces/gameInterfaces';

export class Level {
  private readonly maze: Cell[][];
  private readonly wallSprite: Sprite;
  private readonly pathSprite: Sprite;
  private readonly startSprite: Sprite;
  private readonly endSprite: Sprite;

  public constructor() {
    const mazeWidth = Math.floor(GAME_CONSTANTS.CANVAS.WIDTH / GAME_CONSTANTS.TILE_SIZE);
    const mazeHeight = Math.floor(GAME_CONSTANTS.CANVAS.HEIGHT / GAME_CONSTANTS.TILE_SIZE);
    
    const generator = new MazeGenerator(mazeWidth, mazeHeight);
    this.maze = generator.generate();

    this.wallSprite = this.createSprite(GAME_CONSTANTS.COLORS.WALL);
    this.pathSprite = this.createSprite(GAME_CONSTANTS.COLORS.FLOOR);
    this.startSprite = this.createSprite('#00FF00'); // Green for start
    this.endSprite = this.createSprite('#FF0000');   // Red for end
  }

  public render(ctx: CanvasRenderingContext2D): void {
    const tileSize = GAME_CONSTANTS.TILE_SIZE;

    for (let y = 0; y < this.maze.length; y++) {
      for (let x = 0; x < this.maze[y].length; x++) {
        const cell = this.maze[y][x];
        const screenX = x * tileSize;
        const screenY = y * tileSize;

        switch (cell.type) {
          case CellType.Wall:
            this.wallSprite.render(ctx, screenX, screenY);
            break;
          case CellType.Path:
            this.pathSprite.render(ctx, screenX, screenY);
            break;
          case CellType.Start:
            this.startSprite.render(ctx, screenX, screenY);
            break;
          case CellType.End:
            this.endSprite.render(ctx, screenX, screenY);
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

    return this.maze[tileY][tileX].type === CellType.Wall;
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
}

export default Level;

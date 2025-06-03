import { GAME_CONSTANTS } from '../../constants/gameConstants';
import { Cell, CellType } from './MazeCell';
import { MazeGenerator } from './MazeGenerator';
import { Sprite } from '../../rendering/sprites/Sprite';
import { WallSprite } from '../../rendering/sprites/WallSprite';
import { FloorSprite } from '../../rendering/sprites/FloorSprite';
import type { Position } from '../../interfaces/gameInterfaces';

export class Level {
  private readonly maze: Cell[][];
  private readonly wallSprites: Map<string, Sprite> = new Map();
  private readonly floorSprites: Map<string, Sprite> = new Map();
  private readonly wallShadowSprite: Sprite;
  private readonly _roomTypes: Map<string, string> = new Map();

  public constructor() {
    const mazeWidth = Math.floor((GAME_CONSTANTS.CANVAS.WIDTH * GAME_CONSTANTS.MAZE.SIZE_MULTIPLIER) / GAME_CONSTANTS.TILE_SIZE);
    const mazeHeight = Math.floor((GAME_CONSTANTS.CANVAS.HEIGHT * GAME_CONSTANTS.MAZE.SIZE_MULTIPLIER) / GAME_CONSTANTS.TILE_SIZE);
    
    const generator = new MazeGenerator(mazeWidth, mazeHeight);
    this.maze = generator.generate();
    this.assignFloorTypes();

    // Create sprites for different types
    this.createWallSprites();
    this.createFloorSprites();
    this.wallShadowSprite = this.createShadowSprite();
  }

  private assignFloorTypes(): void {
    // Assign floor types for rooms and paths
    for (let y = 0; y < this.maze.length; y++) {
      for (let x = 0; x < this.maze[y].length; x++) {
        const cell = this.maze[y][x];
        let floorType = null;

        if (cell.type === CellType.Room) {
          floorType = this.determineRoomFloorType(x, y);
        } else if (cell.type === CellType.Path || cell.type === CellType.Start || cell.type === CellType.End) {
          floorType = this.determinePathFloorType(x, y);
        }

        if (floorType) {
          this.maze[y][x] = new Cell(x, y, cell.type, cell.visited, floorType);
        }
      }
    }
  }

  private determineRoomFloorType(startX: number, startY: number): string {
    // Keep track of room IDs to ensure same room gets same floor type
    const roomId = `${Math.floor(startX / 5)}_${Math.floor(startY / 5)}`;
    const roomTypes = this.getRoomTypes();
    
    if (!roomTypes.has(roomId)) {
      // New room - assign a random type
      roomTypes.set(roomId, this.getRandomRoomFloorType());
    }
    
    return roomTypes.get(roomId) || GAME_CONSTANTS.FLOORS.TYPES.STONE;
  }

  private getRoomTypes(): Map<string, string> {
    return this._roomTypes;
  }

  private getRandomRoomFloorType(): string {
    // Rooms can have any floor type with different probabilities
    const random = Math.random();
    if (random < 0.4) {
      return GAME_CONSTANTS.FLOORS.TYPES.STONE;
    } else if (random < 0.6) {
      return GAME_CONSTANTS.FLOORS.TYPES.MARBLE;
    } else if (random < 0.8) {
      return GAME_CONSTANTS.FLOORS.TYPES.DIRT;
    } else if (random < 0.9) {
      return GAME_CONSTANTS.FLOORS.TYPES.CRACKED;
    } else {
      return GAME_CONSTANTS.FLOORS.TYPES.WET;
    }
  }

  private determinePathFloorType(x: number, y: number): string {
    // Check surrounding cells for existing floor types
    const surroundingTypes = this.getSurroundingFloorTypes(x, y);
    
    if (surroundingTypes.size > 0) {
      // Use most common surrounding type
      return this.getMostCommonType(Array.from(surroundingTypes));
    }

    // No surrounding floor types - choose based on context
    if (this.isNearRoom(x, y)) {
      // Paths near rooms have a chance to match room floor
      const nearbyRoom = this.findNearbyRoomType(x, y);
      if (nearbyRoom && Math.random() < 0.7) {
        return nearbyRoom;
      }
    }

    // Default to a random path floor type
    return this.getRandomPathFloorType();
  }

  private getSurroundingFloorTypes(x: number, y: number): Set<string> {
    const types = new Set<string>();
    
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        
        const cell = this.maze[y + dy]?.[x + dx];
        if (cell?.floorType) {
          types.add(cell.floorType);
        }
      }
    }
    
    return types;
  }

  private getMostCommonType(types: string[]): string {
    const counts = new Map<string, number>();
    let maxCount = 0;
    let mostCommon = types[0];

    for (const type of types) {
      const count = (counts.get(type) || 0) + 1;
      counts.set(type, count);
      if (count > maxCount) {
        maxCount = count;
        mostCommon = type;
      }
    }

    return mostCommon;
  }

  private isNearRoom(x: number, y: number): boolean {
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const cell = this.maze[y + dy]?.[x + dx];
        if (cell?.type === CellType.Room) {
          return true;
        }
      }
    }
    return false;
  }

  private findNearbyRoomType(x: number, y: number): string | null {
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const cell = this.maze[y + dy]?.[x + dx];
        if (cell?.type === CellType.Room && cell.floorType) {
          return cell.floorType;
        }
      }
    }
    return null;
  }

  private getRandomPathFloorType(): string {
    // Paths mostly use stone or dirt, with occasional cracked areas
    const random = Math.random();
    if (random < 0.6) {
      return GAME_CONSTANTS.FLOORS.TYPES.STONE;
    } else if (random < 0.9) {
      return GAME_CONSTANTS.FLOORS.TYPES.DIRT;
    } else {
      return GAME_CONSTANTS.FLOORS.TYPES.CRACKED;
    }
  }

  private createWallSprites(): void {
    const size = { width: GAME_CONSTANTS.TILE_SIZE, height: GAME_CONSTANTS.TILE_SIZE };

    // Create variations of each wall type
    Object.values(GAME_CONSTANTS.WALLS.TYPES).forEach((type, typeIndex) => {
      for (let variation = 0; variation < 3; variation++) {
        const key = `${type}_${variation}`;
        this.wallSprites.set(key, new WallSprite(size, type, variation));
      }
    });
  }

  private createFloorSprites(): void {
    const size = { width: GAME_CONSTANTS.TILE_SIZE, height: GAME_CONSTANTS.TILE_SIZE };

    // Create variations of each floor type
    Object.values(GAME_CONSTANTS.FLOORS.TYPES).forEach((type, typeIndex) => {
      for (let variation = 0; variation < 3; variation++) {
        const key = `${type}_${variation}`;
        this.floorSprites.set(key, new FloorSprite(size, type, variation));
      }
    });
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
          
          // Determine wall type based on surroundings
          const wallType = this.determineWallType(x, y);
          const variation = (x * y) % 3; // Create some visual variety
          const key = `${wallType}_${variation}`;
          
          const wallSprite = this.wallSprites.get(key);
          if (wallSprite) {
            wallSprite.render(ctx, screenX, screenY);
          }
        }
      }
    }
  }

  private determineWallType(x: number, y: number): string {
    // Check surrounding cells to determine appropriate wall type
    const surroundingCells = [
      this.getCellType(x, y - 1), // North
      this.getCellType(x + 1, y), // East
      this.getCellType(x, y + 1), // South
      this.getCellType(x - 1, y), // West
    ];

    // Count how many adjacent cells are paths or rooms
    const adjacentOpen = surroundingCells.filter(
      type => type === CellType.Path || type === CellType.Room
    ).length;

    // Determine wall type based on context
    if (adjacentOpen >= 3) {
      // Walls with lots of exposure might be reinforced
      return GAME_CONSTANTS.WALLS.TYPES.REINFORCED;
    } else if (adjacentOpen >= 2) {
      // Walls with moderate exposure might be cracked
      return GAME_CONSTANTS.WALLS.TYPES.CRACKED;
    } else if (adjacentOpen >= 1) {
      // Walls with some exposure might be mossy
      return Math.random() > 0.5 ? GAME_CONSTANTS.WALLS.TYPES.MOSSY : GAME_CONSTANTS.WALLS.TYPES.NORMAL;
    }

    // Interior walls remain normal
    return GAME_CONSTANTS.WALLS.TYPES.NORMAL;
  }

  public renderFloorAndObjects(ctx: CanvasRenderingContext2D): void {
    const tileSize = GAME_CONSTANTS.TILE_SIZE;

    for (let y = 0; y < this.maze.length; y++) {
      for (let x = 0; x < this.maze[y].length; x++) {
        const cell = this.maze[y][x];
        const screenX = x * tileSize;
        const screenY = y * tileSize;

        if (cell.type === CellType.Path || cell.type === CellType.Start || 
            cell.type === CellType.End || cell.type === CellType.Room) {
          // Get floor type and variation
          const floorType = cell.floorType || GAME_CONSTANTS.FLOORS.TYPES.STONE;
          const variation = (x * y) % 3;
          const key = `${floorType}_${variation}`;
          
          const floorSprite = this.floorSprites.get(key);
          if (floorSprite) {
            floorSprite.render(ctx, screenX, screenY);
          }
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

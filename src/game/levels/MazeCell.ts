export enum CellType {
  Wall = 'wall',
  Path = 'path',
  Start = 'start',
  End = 'end',
  Room = 'room',
  RoomWall = 'room-wall',
}

export interface MazeCell {
  readonly x: number;
  readonly y: number;
  readonly type: CellType;
  readonly visited: boolean;
  readonly floorType?: string;
}

export class Cell implements MazeCell {
  public constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly type: CellType = CellType.Wall,
    public readonly visited: boolean = false,
    public readonly floorType?: string,
  ) {}
}

// Ensure there's a default export for better module compatibility
export default Cell;

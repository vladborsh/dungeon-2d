import { CellType, Cell } from './MazeCell';

export class MazeGenerator {
  private readonly width: number;
  private readonly height: number;
  private readonly maze: Cell[][];
  private readonly stack: [number, number][];

  public constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.maze = [];
    this.stack = [];
    this.initializeMaze();
  }

  public generate(): Cell[][] {
    const startX = 1;
    const startY = 1;
    
    this.stack.push([startX, startY]);
    this.maze[startY][startX] = new Cell(startX, startY, CellType.Path, true);

    while (this.stack.length > 0) {
      const [currentX, currentY] = this.stack[this.stack.length - 1];
      const neighbors = this.getUnvisitedNeighbors(currentX, currentY);

      if (neighbors.length === 0) {
        this.stack.pop();
        continue;
      }

      const [nextX, nextY] = neighbors[Math.floor(Math.random() * neighbors.length)];
      
      // Mark the wall between cells as path
      const wallX = currentX + (nextX - currentX) / 2;
      const wallY = currentY + (nextY - currentY) / 2;
      this.maze[wallY][wallX] = new Cell(wallX, wallY, CellType.Path, true);
      
      // Mark the next cell as path and push it to stack
      this.maze[nextY][nextX] = new Cell(nextX, nextY, CellType.Path, true);
      this.stack.push([nextX, nextY]);
    }

    // Set start and end points
    this.maze[1][1] = new Cell(1, 1, CellType.Start, true);
    this.maze[this.height - 2][this.width - 2] = new Cell(this.width - 2, this.height - 2, CellType.End, true);

    return this.maze;
  }

  private initializeMaze(): void {
    for (let y = 0; y < this.height; y++) {
      this.maze[y] = [];
      for (let x = 0; x < this.width; x++) {
        this.maze[y][x] = new Cell(x, y, CellType.Wall);
      }
    }
  }

  private getUnvisitedNeighbors(x: number, y: number): [number, number][] {
    const neighbors: [number, number][] = [];
    const directions = [
      [-2, 0], // Left
      [2, 0],  // Right
      [0, -2], // Up
      [0, 2]   // Down
    ];

    for (const [dx, dy] of directions) {
      const newX = x + dx;
      const newY = y + dy;

      if (
        newX > 0 &&
        newY > 0 &&
        newX < this.width - 1 &&
        newY < this.height - 1 &&
        !this.maze[newY][newX].visited
      ) {
        neighbors.push([newX, newY]);
      }
    }

    return neighbors;
  }
}

export default MazeGenerator;

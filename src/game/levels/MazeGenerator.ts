import { CellType, Cell } from './MazeCell';
import { GAME_CONSTANTS } from '../../constants/gameConstants';

interface Room {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export class MazeGenerator {
  private readonly width: number;
  private readonly height: number;
  private readonly maze: Cell[][];
  private readonly stack: [number, number][];
  private readonly rooms: Room[];

  public constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.maze = [];
    this.stack = [];
    this.rooms = [];
    this.initializeMaze();
  }

  public generate(): Cell[][] {
    // First, generate rooms
    this.generateRooms();
    
    // Then generate the maze
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

    // Connect rooms to the maze
    this.connectRoomsToMaze();

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

  private generateRooms(): void {
    const { MIN_ROOM_SIZE, MAX_ROOM_SIZE, ROOM_ATTEMPTS, MIN_ROOM_COUNT, MAX_ROOM_COUNT } = GAME_CONSTANTS.MAZE.ROOM_GENERATION;
    const targetRoomCount = MIN_ROOM_COUNT + Math.floor(Math.random() * (MAX_ROOM_COUNT - MIN_ROOM_COUNT + 1));
    
    let roomsCreated = 0;
    let attempts = 0;

    while (roomsCreated < targetRoomCount && attempts < ROOM_ATTEMPTS * targetRoomCount) {
      attempts++;
      
      const roomWidth = MIN_ROOM_SIZE + Math.floor(Math.random() * (MAX_ROOM_SIZE - MIN_ROOM_SIZE + 1));
      const roomHeight = MIN_ROOM_SIZE + Math.floor(Math.random() * (MAX_ROOM_SIZE - MIN_ROOM_SIZE + 1));
      
      // Ensure odd coordinates for proper maze grid alignment
      const roomX = 2 + Math.floor(Math.random() * ((this.width - roomWidth - 4) / 2)) * 2;
      const roomY = 2 + Math.floor(Math.random() * ((this.height - roomHeight - 4) / 2)) * 2;
      
      const newRoom: Room = {
        x: roomX,
        y: roomY,
        width: roomWidth,
        height: roomHeight,
      };
      
      if (this.canPlaceRoom(newRoom)) {
        this.placeRoom(newRoom);
        this.rooms.push(newRoom);
        roomsCreated++;
      }
    }
  }

  private canPlaceRoom(room: Room): boolean {
    // Check if room overlaps with existing rooms (with 2-cell buffer)
    for (const existingRoom of this.rooms) {
      if (
        room.x < existingRoom.x + existingRoom.width + 2 &&
        room.x + room.width + 2 > existingRoom.x &&
        room.y < existingRoom.y + existingRoom.height + 2 &&
        room.y + room.height + 2 > existingRoom.y
      ) {
        return false;
      }
    }
    
    // Check boundaries
    return (
      room.x >= 2 &&
      room.y >= 2 &&
      room.x + room.width < this.width - 2 &&
      room.y + room.height < this.height - 2
    );
  }

  private placeRoom(room: Room): void {
    // Create room interior
    for (let y = room.y; y < room.y + room.height; y++) {
      for (let x = room.x; x < room.x + room.width; x++) {
        this.maze[y][x] = new Cell(x, y, CellType.Room, true);
      }
    }
    
    // Create room walls around the perimeter
    for (let y = room.y - 1; y <= room.y + room.height; y++) {
      for (let x = room.x - 1; x <= room.x + room.width; x++) {
        if (
          x >= 0 && x < this.width &&
          y >= 0 && y < this.height &&
          (x === room.x - 1 || x === room.x + room.width ||
           y === room.y - 1 || y === room.y + room.height) &&
          this.maze[y][x].type === CellType.Wall
        ) {
          this.maze[y][x] = new Cell(x, y, CellType.RoomWall);
        }
      }
    }
  }

  private connectRoomsToMaze(): void {
    for (const room of this.rooms) {
      this.connectRoomToMaze(room);
    }
  }

  private connectRoomToMaze(room: Room): void {
    const connectionPoints: [number, number][] = [];
    
    // Find potential connection points on room perimeter
    for (let x = room.x; x < room.x + room.width; x++) {
      // Top and bottom walls
      if (room.y > 1) connectionPoints.push([x, room.y - 1]);
      if (room.y + room.height < this.height - 1) connectionPoints.push([x, room.y + room.height]);
    }
    
    for (let y = room.y; y < room.y + room.height; y++) {
      // Left and right walls
      if (room.x > 1) connectionPoints.push([room.x - 1, y]);
      if (room.x + room.width < this.width - 1) connectionPoints.push([room.x + room.width, y]);
    }
    
    // Create 1-2 connections per room
    const connectionsToMake = 1 + Math.floor(Math.random() * 2);
    const shuffledPoints = this.shuffleArray([...connectionPoints]);
    
    for (let i = 0; i < Math.min(connectionsToMake, shuffledPoints.length); i++) {
      const [x, y] = shuffledPoints[i];
      
      // Create opening in room wall
      this.maze[y][x] = new Cell(x, y, CellType.Path, true);
      
      // Try to connect to nearby maze paths
      this.createPathToNearestMazeCell(x, y);
    }
  }

  private createPathToNearestMazeCell(startX: number, startY: number): void {
    const directions = [
      [-1, 0], [1, 0], [0, -1], [0, 1]
    ];
    
    for (const [dx, dy] of directions) {
      let x = startX + dx;
      let y = startY + dy;
      let distance = 0;
      const maxDistance = 5;
      
      while (
        distance < maxDistance &&
        x > 0 && x < this.width - 1 &&
        y > 0 && y < this.height - 1
      ) {
        if (this.maze[y][x].type === CellType.Path && this.maze[y][x].visited) {
          // Found existing path, create connection
          let connectX = startX;
          let connectY = startY;
          
          while (connectX !== x || connectY !== y) {
            if (connectX < x) connectX++;
            else if (connectX > x) connectX--;
            if (connectY < y) connectY++;
            else if (connectY > y) connectY--;
            
            if (this.maze[connectY][connectX].type === CellType.Wall) {
              this.maze[connectY][connectX] = new Cell(connectX, connectY, CellType.Path, true);
            }
          }
          return;
        }
        
        x += dx;
        y += dy;
        distance++;
      }
    }
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

export default MazeGenerator;

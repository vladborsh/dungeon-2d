import type { Position } from '../../interfaces/gameInterfaces';
import type { Level } from '../levels/Level';
import { CellType } from '../levels/MazeCell';
import type { LootGenerator } from './LootGenerator';
import { GAME_CONSTANTS } from '../../constants/gameConstants';

/**
 * Manages loot generation throughout the dungeon in various strategic locations
 */
export class DungeonLootManager {
  private readonly level: Level;
  private readonly lootGenerator: LootGenerator;

  public constructor(level: Level, lootGenerator: LootGenerator) {
    this.level = level;
    this.lootGenerator = lootGenerator;
  }

  /**
   * Generate loot throughout the dungeon in rooms and strategic locations
   */
  public generateDungeonLoot(): void {
    const mazeWidth = Math.floor(GAME_CONSTANTS.CANVAS.WIDTH / GAME_CONSTANTS.TILE_SIZE);
    const mazeHeight = Math.floor(GAME_CONSTANTS.CANVAS.HEIGHT / GAME_CONSTANTS.TILE_SIZE);
    
    // Generate loot in rooms
    this.generateRoomLoot(mazeWidth, mazeHeight);
    
    // Generate scattered loot throughout paths
    this.generatePathLoot(mazeWidth, mazeHeight);
    
    // Generate loot at strategic intersections
    this.generateIntersectionLoot(mazeWidth, mazeHeight);
    
    // Generate special loot at the end point
    this.generateEndLoot(mazeWidth, mazeHeight);
  }

  /**
   * Generate loot in room areas
   */
  private generateRoomLoot(mazeWidth: number, mazeHeight: number): void {
    const roomCenters: Array<{ x: number; y: number; size: number }> = [];
    
    // First pass: identify room centers and sizes
    for (let y = 1; y < mazeHeight - 1; y++) {
      for (let x = 1; x < mazeWidth - 1; x++) {
        const cellType = this.level.getCellType(x, y);
        
        if (cellType === CellType.Room && this.level.isTileWalkable(x, y)) {
          // Check if this is a room center (surrounded by room cells)
          let roomSize = 1;
          let isCenter = true;
          
          // Simple room center detection
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const neighborType = this.level.getCellType(x + dx, y + dy);
              if (neighborType !== CellType.Room) {
                isCenter = false;
                break;
              }
            }
            if (!isCenter) break;
          }
          
          if (isCenter && !roomCenters.some(center => 
            Math.abs(center.x - x) < 3 && Math.abs(center.y - y) < 3)) {
            roomCenters.push({ x, y, size: roomSize });
          }
        }
      }
    }
    
    // Generate enhanced loot in room centers
    roomCenters.forEach(room => {
      const position: Position = {
        x: room.x * GAME_CONSTANTS.TILE_SIZE + GAME_CONSTANTS.TILE_SIZE / 2,
        y: room.y * GAME_CONSTANTS.TILE_SIZE + GAME_CONSTANTS.TILE_SIZE / 2
      };
      
      // Double-check that the position is walkable before generating loot
      if (this.level.isWalkable(position.x, position.y)) {
        const roomLevel = Math.floor(Math.random() * 4) + 2; // Level 2-5 for rooms
        this.lootGenerator.generateEnhancedRoomLoot(roomLevel, position);
        
        // Add bonus loot cluster around larger rooms
        if (room.size > 1) {
          this.lootGenerator.generateBonusCluster(position, 96, 3, roomLevel);
        }
      }
    });
  }

  /**
   * Generate scattered loot along paths
   */
  private generatePathLoot(mazeWidth: number, mazeHeight: number): void {
    const pathCells: Array<{ x: number; y: number; distance: number }> = [];
    const startPos = this.level.getStartPosition();
    const startTileX = Math.floor(startPos.x / GAME_CONSTANTS.TILE_SIZE);
    const startTileY = Math.floor(startPos.y / GAME_CONSTANTS.TILE_SIZE);
    
    // Collect all walkable path cells with distance from start
    for (let y = 0; y < mazeHeight; y++) {
      for (let x = 0; x < mazeWidth; x++) {
        const cellType = this.level.getCellType(x, y);
        
        // Only consider walkable path cells (not rooms, start, or end)
        if (cellType === CellType.Path && this.level.isTileWalkable(x, y)) {
          const distance = Math.sqrt(
            Math.pow(x - startTileX, 2) + Math.pow(y - startTileY, 2)
          );
          pathCells.push({ x, y, distance });
        }
      }
    }
    
    // Sort by distance and generate loot with scaling difficulty
    pathCells.sort((a, b) => a.distance - b.distance);
    
    // Generate loot in 12% of path cells with increasing value
    const lootCount = Math.floor(pathCells.length * (GAME_CONSTANTS.LOOT_GENERATION.PATH_LOOT_PERCENTAGE / 100));
    const interval = Math.floor(pathCells.length / lootCount);
    
    for (let i = 0; i < lootCount; i++) {
      const cellIndex = i * interval + Math.floor(Math.random() * (interval / 2));
      if (cellIndex >= pathCells.length) break;
      
      const cell = pathCells[cellIndex];
      const position: Position = {
        x: cell.x * GAME_CONSTANTS.TILE_SIZE + GAME_CONSTANTS.TILE_SIZE / 2,
        y: cell.y * GAME_CONSTANTS.TILE_SIZE + GAME_CONSTANTS.TILE_SIZE / 2
      };
      
      // Double-check walkability before generating loot
      if (this.level.isWalkable(position.x, position.y)) {
        // Scale loot level based on distance from start
        const progressRatio = cell.distance / pathCells[pathCells.length - 1].distance;
        const lootLevel = Math.floor(progressRatio * 4) + 1; // Level 1-5
        
        this.lootGenerator.generateExplorationLoot(lootLevel, position, 1.2);
      }
    }
  }

  /**
   * Generate loot at strategic intersections and junctions
   */
  private generateIntersectionLoot(mazeWidth: number, mazeHeight: number): void {
    const intersections: Array<{ x: number; y: number; connections: number }> = [];
    
    // Find path intersections (cells with 3+ walkable neighbors)
    for (let y = 1; y < mazeHeight - 1; y++) {
      for (let x = 1; x < mazeWidth - 1; x++) {
        const cellType = this.level.getCellType(x, y);
        
        if (cellType === CellType.Path && this.level.isTileWalkable(x, y)) {
          let connections = 0;
          const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
          
          directions.forEach(([dx, dy]) => {
            if (this.level.isTileWalkable(x + dx, y + dy)) {
              connections++;
            }
          });
          
          // 3+ connections indicate an intersection
          if (connections >= 3) {
            intersections.push({ x, y, connections });
          }
        }
      }
    }
    
    // Generate loot at intersections (higher chance for more connected intersections)
    intersections.forEach(intersection => {
      const lootChance = Math.min(0.7, GAME_CONSTANTS.LOOT_GENERATION.INTERSECTION_BASE_CHANCE + (intersection.connections - 3) * 0.15);
      
      if (Math.random() < lootChance) {
        const position: Position = {
          x: intersection.x * GAME_CONSTANTS.TILE_SIZE + GAME_CONSTANTS.TILE_SIZE / 2,
          y: intersection.y * GAME_CONSTANTS.TILE_SIZE + GAME_CONSTANTS.TILE_SIZE / 2
        };
        
        // Final check that the position is walkable
        if (this.level.isWalkable(position.x, position.y)) {
          const level = Math.floor(Math.random() * 3) + 2; // Level 2-4 for intersections
          this.lootGenerator.generateEnvironmentalLoot('treasure_chest', level, position);
        }
      }
    });
  }

  /**
   * Generate special loot near the end point
   */
  private generateEndLoot(mazeWidth: number, mazeHeight: number): void {
    for (let y = 0; y < mazeHeight; y++) {
      for (let x = 0; x < mazeWidth; x++) {
        const cellType = this.level.getCellType(x, y);
        
        if (cellType === CellType.End) {
          const position: Position = {
            x: x * GAME_CONSTANTS.TILE_SIZE + GAME_CONSTANTS.TILE_SIZE / 2,
            y: y * GAME_CONSTANTS.TILE_SIZE + GAME_CONSTANTS.TILE_SIZE / 2
          };
          
          // Generate multiple high-value rewards at the end
          this.lootGenerator.generateQuestReward('completion', 6, position);
          this.lootGenerator.generateQuestReward('completion', 5, position);
          
          // Create a large bonus cluster around the end
          this.lootGenerator.generateBonusCluster(position, 
            GAME_CONSTANTS.LOOT_GENERATION.END_BONUS_RADIUS, 
            GAME_CONSTANTS.LOOT_GENERATION.END_BONUS_COUNT, 5);
          
          // Add guaranteed rare loot
          this.lootGenerator.generateCustomLoot([
            { itemId: 'crystal_staff', quantity: 1, chance: 0.8 },
            { itemId: 'shadow_dagger', quantity: 1, chance: 0.7 },
            { itemId: 'amulet_of_vitality', quantity: 1, chance: 0.6 },
            { itemId: 'ring_of_strength', quantity: 1, chance: 0.5 },
            { itemId: 'boots_of_speed', quantity: 1, chance: 0.4 }
          ], position);
          
          break;
        }
      }
    }
  }
}

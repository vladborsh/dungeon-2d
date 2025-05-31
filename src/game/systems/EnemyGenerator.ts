import type { Position, EnemyAI } from '../../interfaces/gameInterfaces';
import { EnemyType } from '../../interfaces/gameInterfaces';
import type { Level } from '../levels/Level';
import { CellType } from '../levels/MazeCell';
import { Goblin, Skeleton, Spider, Troll } from '../entities/EnemyTypes';
import { Enemy } from '../entities/Enemy';
import { RandomMovementAI } from './ai/RandomMovementAI';
import { PatrolAI } from './ai/PatrolAI';
import { GuardAI } from './ai/GuardAI';
import { AggressiveAI } from './ai/AggressiveAI';
import { GAME_CONSTANTS } from '../../constants/gameConstants';
import type { GameEngine } from '../../core/GameEngine';

interface EnemySpawnConfig {
  readonly type: EnemyType;
  readonly aiType: 'random' | 'patrol' | 'guard' | 'aggressive';
  readonly weight: number; // Spawn weight/probability
}

export class EnemyGenerator {
  private readonly level: Level;
  private readonly spawnConfigs: EnemySpawnConfig[];
  private readonly gameEngine: GameEngine;

  public constructor(level: Level, gameEngine: GameEngine) {
    this.level = level;
    this.gameEngine = gameEngine;
    this.spawnConfigs = [
      { type: EnemyType.GOBLIN, aiType: 'random', weight: 0.4 },
      { type: EnemyType.GOBLIN, aiType: 'patrol', weight: 0.3 },
      { type: EnemyType.SKELETON, aiType: 'aggressive', weight: 0.2 },
      { type: EnemyType.SKELETON, aiType: 'guard', weight: 0.2 },
      { type: EnemyType.SPIDER, aiType: 'random', weight: 0.3 },
      { type: EnemyType.SPIDER, aiType: 'patrol', weight: 0.2 },
      { type: EnemyType.TROLL, aiType: 'guard', weight: 0.1 },
      { type: EnemyType.TROLL, aiType: 'aggressive', weight: 0.1 },
    ];
  }

  public generateDungeonEnemies(): Enemy[] {
    const enemies: Enemy[] = [];
    // Use the same larger maze dimensions as Level class
    const mazeWidth = Math.floor((GAME_CONSTANTS.CANVAS.WIDTH * 1.5) / GAME_CONSTANTS.TILE_SIZE);
    const mazeHeight = Math.floor((GAME_CONSTANTS.CANVAS.HEIGHT * 1.5) / GAME_CONSTANTS.TILE_SIZE);

    // Generate enemies in rooms
    const roomEnemies = this.generateRoomEnemies(mazeWidth, mazeHeight);
    enemies.push(...roomEnemies);

    // Generate enemies on paths
    const pathEnemies = this.generatePathEnemies(mazeWidth, mazeHeight);
    enemies.push(...pathEnemies);

    return enemies;
  }

  private generateRoomEnemies(mazeWidth: number, mazeHeight: number): Enemy[] {
    const enemies: Enemy[] = [];
    const roomCenters = this.findRoomCenters(mazeWidth, mazeHeight);

    roomCenters.forEach(room => {
      if (Math.random() < GAME_CONSTANTS.ENEMIES.SPAWN.ROOM_CHANCE) {
        const enemyCount = 1 + Math.floor(Math.random() * GAME_CONSTANTS.ENEMIES.SPAWN.MAX_ENEMIES_PER_ROOM);
        
        for (let i = 0; i < enemyCount; i++) {
          const position = this.getRandomPositionInRoom(room);
          if (this.isValidSpawnPosition(position)) {
            const enemy = this.createRandomEnemy(position, ['guard', 'patrol']);
            if (enemy) {
              enemy.setLevel(this.level);
              enemies.push(enemy);
            }
          }
        }
      }
    });

    return enemies;
  }

  private generatePathEnemies(mazeWidth: number, mazeHeight: number): Enemy[] {
    const enemies: Enemy[] = [];
    const pathCells = this.findPathCells(mazeWidth, mazeHeight);
    const startPos = this.level.getStartPosition();

    pathCells.forEach(cell => {
      const position: Position = {
        x: cell.x * GAME_CONSTANTS.TILE_SIZE + GAME_CONSTANTS.TILE_SIZE / 2,
        y: cell.y * GAME_CONSTANTS.TILE_SIZE + GAME_CONSTANTS.TILE_SIZE / 2
      };

      // Check distance from start
      const distanceFromStart = Math.sqrt(
        Math.pow(position.x - startPos.x, 2) + 
        Math.pow(position.y - startPos.y, 2)
      );

      if (distanceFromStart < GAME_CONSTANTS.ENEMIES.SPAWN.MIN_DISTANCE_FROM_START) {
        return; // Too close to start
      }

      if (Math.random() < GAME_CONSTANTS.ENEMIES.SPAWN.PATH_CHANCE) {
        const enemy = this.createRandomEnemy(position, ['random', 'aggressive']);
        if (enemy) {
          enemy.setLevel(this.level);
          enemies.push(enemy);
        }
      }
    });

    return enemies;
  }

  public createRandomEnemy(position: Position, preferredAITypes?: string[]): Enemy | null {
    const availableConfigs = preferredAITypes 
      ? this.spawnConfigs.filter(config => preferredAITypes.includes(config.aiType))
      : this.spawnConfigs;

    if (availableConfigs.length === 0) {
      return null;
    }

    // Weighted random selection
    const totalWeight = availableConfigs.reduce((sum, config) => sum + config.weight, 0);
    let random = Math.random() * totalWeight;

    for (const config of availableConfigs) {
      random -= config.weight;
      if (random <= 0) {
        const ai = this.createAI(config.aiType, position);
        return this.createEnemyOfType(config.type, position, ai);
      }
    }

    // Fallback
    const config = availableConfigs[0];
    const ai = this.createAI(config.aiType, position);
    return this.createEnemyOfType(config.type, position, ai);
  }

  public createEnemyOfType(type: EnemyType, position: Position, ai: EnemyAI): Enemy | null {
    switch (type) {
      case EnemyType.GOBLIN:
        return new Goblin(position, ai, this.gameEngine);
      case EnemyType.SKELETON:
        return new Skeleton(position, ai, this.gameEngine);
      case EnemyType.SPIDER:
        return new Spider(position, ai, this.gameEngine);
      case EnemyType.TROLL:
        return new Troll(position, ai, this.gameEngine);
      default:
        return null;
    }
  }

  private createAI(aiType: string, position: Position): EnemyAI {
    switch (aiType) {
      case 'patrol':
        return new PatrolAI(position);
      case 'guard':
        return new GuardAI(position, 100);
      case 'aggressive':
        return new AggressiveAI();
      case 'random':
      default:
        return new RandomMovementAI();
    }
  }

  private findRoomCenters(mazeWidth: number, mazeHeight: number): Array<{ x: number; y: number; size: number }> {
    const roomCenters: Array<{ x: number; y: number; size: number }> = [];

    for (let y = 1; y < mazeHeight - 1; y++) {
      for (let x = 1; x < mazeWidth - 1; x++) {
        const cellType = this.level.getCellType(x, y);
        
        if (cellType === CellType.Room && this.level.isTileWalkable(x, y)) {
          // Check if this is a room center
          let roomSize = 1;
          let isCenter = true;
          
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

    return roomCenters;
  }

  private findPathCells(mazeWidth: number, mazeHeight: number): Array<{ x: number; y: number }> {
    const pathCells: Array<{ x: number; y: number }> = [];

    for (let y = 0; y < mazeHeight; y++) {
      for (let x = 0; x < mazeWidth; x++) {
        const cellType = this.level.getCellType(x, y);
        
        if (cellType === CellType.Path && this.level.isTileWalkable(x, y)) {
          pathCells.push({ x, y });
        }
      }
    }

    // Return only a subset for enemy spawning
    const maxEnemies = Math.floor(pathCells.length * 0.1); // 10% of path cells max
    const shuffled = this.shuffleArray([...pathCells]);
    return shuffled.slice(0, maxEnemies);
  }

  private getRandomPositionInRoom(room: { x: number; y: number; size: number }): Position {
    const baseX = room.x * GAME_CONSTANTS.TILE_SIZE;
    const baseY = room.y * GAME_CONSTANTS.TILE_SIZE;
    
    // Add some randomness within the room
    const offsetX = (Math.random() - 0.5) * GAME_CONSTANTS.TILE_SIZE * 2;
    const offsetY = (Math.random() - 0.5) * GAME_CONSTANTS.TILE_SIZE * 2;
    
    return {
      x: baseX + offsetX,
      y: baseY + offsetY
    };
  }

  private isValidSpawnPosition(position: Position): boolean {
    // Check if position is walkable
    if (!this.level.isWalkable(position.x, position.y)) {
      return false;
    }

    // Check distance from start position
    const startPos = this.level.getStartPosition();
    const distanceFromStart = Math.sqrt(
      Math.pow(position.x - startPos.x, 2) + 
      Math.pow(position.y - startPos.y, 2)
    );

    return distanceFromStart >= GAME_CONSTANTS.ENEMIES.SPAWN.MIN_DISTANCE_FROM_START;
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

import type { Position, Item } from '../../interfaces/gameInterfaces';
import { ItemDatabase } from './ItemDatabase';
import { LootSystem } from './LootSystem';
import { GAME_CONSTANTS } from '../../constants/gameConstants';

/**
 * Responsible for generating loot in various scenarios throughout the game
 */
export class LootGenerator {
  private readonly lootSystem: LootSystem;

  public constructor(lootSystem: LootSystem) {
    this.lootSystem = lootSystem;
  }

  /**
   * Generate loot from defeating a monster
   */
  public generateMonsterLoot(monsterType: string, level: number, position: Position): void {
    let lootTableId: string;
    
    switch (monsterType) {
      case 'basic':
        lootTableId = 'basic_monster';
        break;
      case 'elite':
        lootTableId = 'elite_monster';
        break;
      case 'boss':
        lootTableId = 'boss';
        break;
      default:
        lootTableId = 'basic_monster';
    }

    this.lootSystem.generateLoot(lootTableId, level, position);
  }

  /**
   * Generate loot from environmental sources (chests, nodes, etc.)
   */
  public generateEnvironmentalLoot(sourceType: string, level: number, position: Position): void {
    let lootTableId: string;
    
    switch (sourceType) {
      case 'treasure_chest':
        lootTableId = 'treasure_chest';
        break;
      case 'ore_node':
        lootTableId = 'ore_node';
        break;
      case 'herb_node':
        lootTableId = 'herb_node';
        break;
      default:
        // Fallback to random loot
        this.lootSystem.generateRandomLoot(level, position);
        return;
    }

    this.lootSystem.generateLoot(lootTableId, level, position);
  }

  /**
   * Generate quest reward loot
   */
  public generateQuestReward(questType: string, level: number, position: Position): void {
    // For now, use treasure chest loot table for quest rewards
    // This can be expanded with specific quest loot tables
    this.lootSystem.generateLoot('treasure_chest', level, position);
  }

  /**
   * Generate random world loot (for exploration rewards)
   */
  public generateWorldLoot(level: number, position: Position): void {
    this.lootSystem.generateRandomLoot(level, position);
  }

  /**
   * Generate loot with custom parameters
   */
  public generateCustomLoot(
    items: Array<{ itemId: string; quantity: number; chance: number }>,
    position: Position
  ): void {
    items.forEach(itemData => {
      if (Math.random() <= itemData.chance) {
        const item = ItemDatabase.getItem(itemData.itemId);
        if (item) {
          const dropPosition: Position = {
            x: position.x + (Math.random() - 0.5),
            y: position.y + (Math.random() - 0.5)
          };
          this.lootSystem.createItemDrop(item, itemData.quantity, dropPosition);
        }
      }
    });
  }

  /**
   * Generate enhanced room loot with better variety
   */
  public generateEnhancedRoomLoot(level: number, position: Position): void {
    // Rooms should have better loot than regular areas
    const enhancedLevel = level + 2;
    
    // Multiple chances for different types of loot
    const lootSources = [
      { table: 'treasure_chest', chance: 0.6, level: enhancedLevel },
      { table: 'ore_node', chance: 0.3, level: enhancedLevel },
      { table: 'herb_node', chance: 0.4, level: enhancedLevel }
    ];
    
    lootSources.forEach(source => {
      if (Math.random() < source.chance) {
        this.lootSystem.generateLoot(source.table, source.level, position);
      }
    });
    
    // Additional chance for rare random loot
    if (Math.random() < 0.2) {
      this.lootSystem.generateRandomLoot(enhancedLevel, position);
    }
  }

  /**
   * Generate exploration loot with scaling difficulty
   */
  public generateExplorationLoot(baseLevel: number, position: Position, modifier: number = 1): void {
    const adjustedLevel = Math.max(1, Math.floor(baseLevel * modifier));
    
    // Lower chance but decent rewards for exploration
    if (Math.random() < 0.4) {
      this.lootSystem.generateRandomLoot(adjustedLevel, position);
    }
  }

  /**
   * Generate bonus loot clusters around special locations
   */
  public generateBonusCluster(centerPosition: Position, radius: number, lootCount: number, level: number): void {
    for (let i = 0; i < lootCount; i++) {
      const angle = (Math.PI * 2 * i) / lootCount;
      const distance = Math.random() * radius;
      
      const position: Position = {
        x: centerPosition.x + Math.cos(angle) * distance,
        y: centerPosition.y + Math.sin(angle) * distance
      };
      
      // Mix of different loot types
      const lootType = Math.random();
      if (lootType < 0.4) {
        this.generateEnvironmentalLoot('treasure_chest', level, position);
      } else if (lootType < 0.7) {
        this.generateWorldLoot(level, position);
      } else {
        this.generateEnvironmentalLoot('ore_node', level, position);
      }
    }
  }
}

import type { Item, ItemType } from '../../interfaces/gameInterfaces';
import { ItemDatabase } from './ItemDatabase';
import { GAME_CONSTANTS } from '../../constants/gameConstants';

/**
 * Responsible for generating items with various parameters and requirements
 */
export class ItemGenerator {
  /**
   * Generate random items for loot drops
   */
  public static generateRandomItems(level: number = 1, count?: number): Item[] {
    const itemCount = count ?? Math.floor(Math.random() * GAME_CONSTANTS.ITEM_GENERATION.MAX_RANDOM_ITEMS) + 1;
    const items: Item[] = [];
    
    for (let i = 0; i < itemCount; i++) {
      const randomItems = ItemDatabase.createRandomLoot(level);
      items.push(...randomItems);
    }
    
    return items;
  }

  /**
   * Generate items of a specific type
   */
  public static generateItemsByType(type: ItemType, level: number = 1, count: number = 1): Item[] {
    const itemsOfType = ItemDatabase.getItemsByType(type);
    const items: Item[] = [];
    
    // Filter items by level (assuming items have a level property)
    const availableItems = itemsOfType.filter(item => {
      // For now, all items are available at all levels
      // This can be enhanced with level requirements later
      return true;
    });
    
    if (availableItems.length === 0) {
      return items;
    }
    
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * availableItems.length);
      items.push(availableItems[randomIndex]);
    }
    
    return items;
  }

  /**
   * Generate items by rarity
   */
  public static generateItemsByRarity(rarity: string, count: number = 1): Item[] {
    const allItems = ItemDatabase.getAllItems();
    const itemsOfRarity = allItems.filter(item => item.rarity === rarity);
    const items: Item[] = [];
    
    if (itemsOfRarity.length === 0) {
      return items;
    }
    
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * itemsOfRarity.length);
      items.push(itemsOfRarity[randomIndex]);
    }
    
    return items;
  }

  /**
   * Generate items with weighted rarity distribution
   */
  public static generateWeightedRarityItems(level: number = 1, count: number = 1): Item[] {
    const items: Item[] = [];
    const allItems = ItemDatabase.getAllItems();
    
    // Calculate rarity weights based on level
    const rarityWeights = this.calculateRarityWeights(level);
    
    for (let i = 0; i < count; i++) {
      const selectedRarity = this.selectRarityByWeight(rarityWeights);
      const itemsOfRarity = allItems.filter(item => item.rarity === selectedRarity);
      
      if (itemsOfRarity.length > 0) {
        const randomIndex = Math.floor(Math.random() * itemsOfRarity.length);
        items.push(itemsOfRarity[randomIndex]);
      }
    }
    
    return items;
  }

  /**
   * Generate starter items for new players
   */
  public static generateStarterItems(): Item[] {
    const starterItems: Item[] = [];
    
    GAME_CONSTANTS.ITEM_GENERATION.STARTER_ITEMS.forEach(itemId => {
      const item = ItemDatabase.getItem(itemId);
      if (item) {
        starterItems.push(item);
      }
    });
    
    return starterItems;
  }

  /**
   * Generate items for specific scenarios (quest rewards, shop inventory, etc.)
   */
  public static generateScenarioItems(scenario: string, level: number = 1): Item[] {
    const items: Item[] = [];
    
    switch (scenario) {
      case 'shop_basic':
        return this.generateShopInventory('basic', level);
      case 'shop_advanced':
        return this.generateShopInventory('advanced', level);
      case 'quest_reward':
        return this.generateQuestRewardItems(level);
      case 'dungeon_loot':
        return this.generateDungeonLoot(level);
      default:
        return this.generateRandomItems(level);
    }
  }

  /**
   * Generate shop inventory based on shop type and level
   */
  private static generateShopInventory(shopType: string, level: number): Item[] {
    const items: Item[] = [];
    const rarityDistribution = shopType === 'basic' 
      ? GAME_CONSTANTS.ITEM_GENERATION.SHOP_RARITY.BASIC
      : GAME_CONSTANTS.ITEM_GENERATION.SHOP_RARITY.ADVANCED;
    
    Object.entries(rarityDistribution).forEach(([rarity, count]) => {
      const rarityItems = this.generateItemsByRarity(rarity, count as number);
      items.push(...rarityItems);
    });
    
    return items;
  }

  /**
   * Generate quest reward items
   */
  private static generateQuestRewardItems(level: number): Item[] {
    // Slightly better than random loot
    const enhancedLevel = level + 1;
    return this.generateWeightedRarityItems(enhancedLevel, 
      Math.floor(Math.random() * GAME_CONSTANTS.ITEM_GENERATION.QUEST_REWARD_COUNT) + 1);
  }

  /**
   * Generate dungeon-specific loot
   */
  private static generateDungeonLoot(level: number): Item[] {
    // Dungeon loot has better rarity chances
    const items: Item[] = [];
    const lootCount = Math.floor(Math.random() * GAME_CONSTANTS.ITEM_GENERATION.DUNGEON_LOOT_COUNT) + 1;
    
    for (let i = 0; i < lootCount; i++) {
      const enhancedLevel = level + 2; // Better loot in dungeons
      const dungeonItems = this.generateWeightedRarityItems(enhancedLevel, 1);
      items.push(...dungeonItems);
    }
    
    return items;
  }

  /**
   * Calculate rarity weights based on level
   */
  private static calculateRarityWeights(level: number): Record<string, number> {
    const baseWeights = GAME_CONSTANTS.ITEM_GENERATION.RARITY_WEIGHTS.BASE;
    const levelModifiers = GAME_CONSTANTS.ITEM_GENERATION.RARITY_WEIGHTS.LEVEL_MODIFIERS;
    
    return {
      common: Math.max(baseWeights.COMMON - level * levelModifiers.COMMON, 
        GAME_CONSTANTS.ITEM_GENERATION.RARITY_WEIGHTS.MINIMUMS.COMMON),
      uncommon: Math.min(baseWeights.UNCOMMON + level * levelModifiers.UNCOMMON, 
        GAME_CONSTANTS.ITEM_GENERATION.RARITY_WEIGHTS.MAXIMUMS.UNCOMMON),
      rare: Math.min(baseWeights.RARE + level * levelModifiers.RARE, 
        GAME_CONSTANTS.ITEM_GENERATION.RARITY_WEIGHTS.MAXIMUMS.RARE),
      epic: Math.min(baseWeights.EPIC + level * levelModifiers.EPIC, 
        GAME_CONSTANTS.ITEM_GENERATION.RARITY_WEIGHTS.MAXIMUMS.EPIC),
      legendary: Math.min(level * levelModifiers.LEGENDARY, 
        GAME_CONSTANTS.ITEM_GENERATION.RARITY_WEIGHTS.MAXIMUMS.LEGENDARY)
    };
  }

  /**
   * Select a rarity based on weighted distribution
   */
  private static selectRarityByWeight(weights: Record<string, number>): string {
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    let randomValue = Math.random() * totalWeight;
    
    for (const [rarity, weight] of Object.entries(weights)) {
      randomValue -= weight;
      if (randomValue <= 0) {
        return rarity;
      }
    }
    
    return 'common'; // Fallback
  }
}

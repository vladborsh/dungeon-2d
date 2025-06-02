import type { Position, Item } from '../../interfaces/gameInterfaces';
import { ItemDatabase } from './ItemDatabase';
import { ItemDrop } from '../entities/ItemDrop';
import { GAME_CONSTANTS } from '../../constants/gameConstants';

export interface LootTable {
  readonly items: Array<{
    readonly itemId: string;
    readonly weight: number;
    readonly minQuantity: number;
    readonly maxQuantity: number;
    readonly minLevel: number;
  }>;
}

export class LootSystem {
  private static readonly lootTables: Map<string, LootTable> = new Map();
  private readonly itemDrops: ItemDrop[];
  private playerPosition: Position;

  public constructor() {
    this.itemDrops = [];
    this.playerPosition = { x: 0, y: 0 };
    this.initializeLootTables();
  }

  public getItemDrops(): readonly ItemDrop[] {
    return this.itemDrops;
  }

  public generateLoot(lootTableId: string, level: number, position: Position): void {
    const lootTable = LootSystem.lootTables.get(lootTableId);
    if (!lootTable) return;

    // Check if loot should drop based on drop chance
    if (Math.random() > GAME_CONSTANTS.ITEMS.DROP_CHANCE) return;

    // Filter items by level requirement
    const availableItems = lootTable.items.filter(item => item.minLevel <= level);
    if (availableItems.length === 0) return;

    // Calculate total weight
    const totalWeight = availableItems.reduce((sum, item) => sum + item.weight, 0);

    // Select random item based on weight
    let randomValue = Math.random() * totalWeight;
    let selectedItem = availableItems[0];

    for (const item of availableItems) {
      randomValue -= item.weight;
      if (randomValue <= 0) {
        selectedItem = item;
        break;
      }
    }

    // Get item from database
    const item = ItemDatabase.getItem(selectedItem.itemId);
    if (!item) return;

    // Calculate quantity
    const quantity = Math.floor(
      Math.random() * (selectedItem.maxQuantity - selectedItem.minQuantity + 1)
    ) + selectedItem.minQuantity;

    // Create item drop with slight position randomization
    const dropPosition: Position = {
      x: position.x + (Math.random() - 0.5) * 32,
      y: position.y + (Math.random() - 0.5) * 32
    };

    this.createItemDrop(item, quantity, dropPosition);
  }

  public generateRandomLoot(level: number, position: Position): void {
    const loot = ItemDatabase.createRandomLoot(level);
    
    loot.forEach((item, index) => {
      const dropPosition: Position = {
        x: position.x + (Math.random() - 0.5) * 48 + index * 16,
        y: position.y + (Math.random() - 0.5) * 48
      };
      
      this.createItemDrop(item, 1, dropPosition);
    });
  }

  public createItemDrop(item: Item, quantity: number, position: Position): void {
    const itemDrop = new ItemDrop(position, item, quantity);
    this.itemDrops.push(itemDrop);
  }

  public updatePlayerPosition(position: Position): void {
    this.playerPosition = position;
  }

  public updateItemDrops(): void {
    // Update all item drops with player position for magnetism
    this.itemDrops.forEach(drop => drop.update(this.playerPosition));

    // Remove expired drops
    for (let i = this.itemDrops.length - 1; i >= 0; i--) {
      if (this.itemDrops[i].isExpired()) {
        this.itemDrops.splice(i, 1);
      }
    }
  }

  public checkItemCollection(playerPosition: Position, playerSize: { width: number; height: number }): ItemDrop[] {
    const collectedItems: ItemDrop[] = [];

    for (let i = this.itemDrops.length - 1; i >= 0; i--) {
      const drop = this.itemDrops[i];
      if (drop.canCollect(playerPosition, playerSize)) {
        collectedItems.push(drop);
        this.itemDrops.splice(i, 1);
      }
    }

    return collectedItems;
  }

  public renderItemDrops(ctx: CanvasRenderingContext2D): void {
    this.itemDrops.forEach(drop => drop.render(ctx));
  }

  private initializeLootTables(): void {
    // Basic monster loot table
    LootSystem.lootTables.set('basic_monster', {
      items: [
        { itemId: 'iron_ore', weight: 30, minQuantity: 1, maxQuantity: 3, minLevel: 1 },
        { itemId: 'healing_herb', weight: 25, minQuantity: 1, maxQuantity: 2, minLevel: 1 },
        { itemId: 'health_potion', weight: 15, minQuantity: 1, maxQuantity: 1, minLevel: 1 },
        { itemId: 'silver_ore', weight: 10, minQuantity: 1, maxQuantity: 2, minLevel: 3 },
        { itemId: 'rusty_sword', weight: 8, minQuantity: 1, maxQuantity: 1, minLevel: 1 },
        { itemId: 'leather_helmet', weight: 5, minQuantity: 1, maxQuantity: 1, minLevel: 2 },
        { itemId: 'mana_crystal', weight: 7, minQuantity: 1, maxQuantity: 1, minLevel: 5 }
      ]
    });

    // Elite monster loot table
    LootSystem.lootTables.set('elite_monster', {
      items: [
        { itemId: 'iron_sword', weight: 20, minQuantity: 1, maxQuantity: 1, minLevel: 3 },
        { itemId: 'iron_chestplate', weight: 18, minQuantity: 1, maxQuantity: 1, minLevel: 4 },
        { itemId: 'mana_crystal', weight: 15, minQuantity: 1, maxQuantity: 3, minLevel: 3 },
        { itemId: 'greater_health_potion', weight: 12, minQuantity: 1, maxQuantity: 2, minLevel: 5 },
        { itemId: 'elven_bow', weight: 10, minQuantity: 1, maxQuantity: 1, minLevel: 6 },
        { itemId: 'chainmail_leggings', weight: 8, minQuantity: 1, maxQuantity: 1, minLevel: 5 },
        { itemId: 'shadow_essence', weight: 5, minQuantity: 1, maxQuantity: 1, minLevel: 8 },
        { itemId: 'ring_of_strength', weight: 3, minQuantity: 1, maxQuantity: 1, minLevel: 10 }
      ]
    });

    // Boss loot table
    LootSystem.lootTables.set('boss', {
      items: [
        { itemId: 'crystal_staff', weight: 15, minQuantity: 1, maxQuantity: 1, minLevel: 8 },
        { itemId: 'shadow_dagger', weight: 12, minQuantity: 1, maxQuantity: 1, minLevel: 10 },
        { itemId: 'tower_shield', weight: 10, minQuantity: 1, maxQuantity: 1, minLevel: 7 },
        { itemId: 'amulet_of_vitality', weight: 8, minQuantity: 1, maxQuantity: 1, minLevel: 8 },
        { itemId: 'boots_of_speed', weight: 5, minQuantity: 1, maxQuantity: 1, minLevel: 12 },
        { itemId: 'shadow_essence', weight: 20, minQuantity: 2, maxQuantity: 5, minLevel: 5 },
        { itemId: 'mana_crystal', weight: 15, minQuantity: 3, maxQuantity: 8, minLevel: 5 },
        { itemId: 'greater_health_potion', weight: 10, minQuantity: 2, maxQuantity: 4, minLevel: 5 }
      ]
    });

    // Resource nodes (mining, gathering)
    LootSystem.lootTables.set('ore_node', {
      items: [
        { itemId: 'iron_ore', weight: 60, minQuantity: 2, maxQuantity: 5, minLevel: 1 },
        { itemId: 'silver_ore', weight: 25, minQuantity: 1, maxQuantity: 3, minLevel: 3 },
        { itemId: 'mana_crystal', weight: 15, minQuantity: 1, maxQuantity: 2, minLevel: 5 }
      ]
    });

    LootSystem.lootTables.set('herb_node', {
      items: [
        { itemId: 'healing_herb', weight: 70, minQuantity: 1, maxQuantity: 4, minLevel: 1 },
        { itemId: 'shadow_essence', weight: 30, minQuantity: 1, maxQuantity: 1, minLevel: 8 }
      ]
    });

    // Treasure chest loot table
    LootSystem.lootTables.set('treasure_chest', {
      items: [
        { itemId: 'iron_sword', weight: 15, minQuantity: 1, maxQuantity: 1, minLevel: 2 },
        { itemId: 'iron_chestplate', weight: 12, minQuantity: 1, maxQuantity: 1, minLevel: 3 },
        { itemId: 'health_potion', weight: 20, minQuantity: 2, maxQuantity: 5, minLevel: 1 },
        { itemId: 'mana_potion', weight: 18, minQuantity: 2, maxQuantity: 4, minLevel: 1 },
        { itemId: 'mana_crystal', weight: 10, minQuantity: 1, maxQuantity: 3, minLevel: 3 },
        { itemId: 'ring_of_strength', weight: 5, minQuantity: 1, maxQuantity: 1, minLevel: 5 },
        { itemId: 'elven_bow', weight: 8, minQuantity: 1, maxQuantity: 1, minLevel: 4 },
        { itemId: 'greater_health_potion', weight: 12, minQuantity: 1, maxQuantity: 3, minLevel: 4 }
      ]
    });
  }

  public static getLootTable(id: string): LootTable | undefined {
    return LootSystem.lootTables.get(id);
  }

  public clearAllDrops(): void {
    this.itemDrops.length = 0;
  }

  public removeItemDrop(drop: ItemDrop): boolean {
    const index = this.itemDrops.indexOf(drop);
    if (index !== -1) {
      this.itemDrops.splice(index, 1);
      return true;
    }
    return false;
  }
}

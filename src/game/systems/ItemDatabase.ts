import type { 
  Item, 
  ResourceItem, 
  WeaponItem, 
  ArmorItem, 
  ConsumableItem, 
  ArtifactItem
} from '../../interfaces/gameInterfaces';

import {
  ItemType,
  ResourceType,
  WeaponType,
  ArmorType
} from '../../interfaces/gameInterfaces';

export class ItemDatabase {
  private static items: Map<string, Item> = new Map();

  public static initialize(): void {
    this.registerResources();
    this.registerWeapons();
    this.registerArmor();
    this.registerConsumables();
    this.registerArtifacts();
  }

  public static getItem(id: string): Item | null {
    return this.items.get(id) || null;
  }

  public static getAllItems(): Item[] {
    return Array.from(this.items.values());
  }

  public static getItemsByType(type: ItemType): Item[] {
    return Array.from(this.items.values()).filter(item => item.type === type);
  }

  private static registerItem(item: Item): void {
    this.items.set(item.id, item);
  }

  private static registerResources(): void {
    const resources: ResourceItem[] = [
      {
        id: 'iron_ore',
        name: 'Iron Ore',
        description: 'Common metal ore used in crafting',
        type: ItemType.RESOURCE,
        resourceType: ResourceType.ORE,
        rarity: 'common',
        value: 5,
        stackable: true,
        maxStack: 99
      },
      {
        id: 'silver_ore',
        name: 'Silver Ore',
        description: 'Rare metal ore with magical properties',
        type: ItemType.RESOURCE,
        resourceType: ResourceType.ORE,
        rarity: 'uncommon',
        value: 15,
        stackable: true,
        maxStack: 99
      },
      {
        id: 'healing_herb',
        name: 'Healing Herb',
        description: 'Natural herb with restorative properties',
        type: ItemType.RESOURCE,
        resourceType: ResourceType.HERB,
        rarity: 'common',
        value: 8,
        stackable: true,
        maxStack: 50
      },
      {
        id: 'mana_crystal',
        name: 'Mana Crystal',
        description: 'Crystallized magical energy',
        type: ItemType.RESOURCE,
        resourceType: ResourceType.GEM,
        rarity: 'rare',
        value: 25,
        stackable: true,
        maxStack: 20
      },
      {
        id: 'shadow_essence',
        name: 'Shadow Essence',
        description: 'Dark energy essence from defeated monsters',
        type: ItemType.RESOURCE,
        resourceType: ResourceType.ESSENCE,
        rarity: 'epic',
        value: 50,
        stackable: true,
        maxStack: 10
      }
    ];

    resources.forEach(resource => this.registerItem(resource));
  }

  private static registerWeapons(): void {
    const weapons: WeaponItem[] = [
      {
        id: 'rusty_sword',
        name: 'Rusty Sword',
        description: 'An old, worn sword that has seen better days',
        type: ItemType.WEAPON,
        weaponType: WeaponType.SWORD,
        rarity: 'common',
        value: 20,
        stackable: false,
        maxStack: 1,
        damage: 10,
        attackSpeed: 1.0,
        range: 1,
        durability: 80,
        maxDurability: 100
      },
      {
        id: 'iron_sword',
        name: 'Iron Sword',
        description: 'A sturdy sword forged from iron',
        type: ItemType.WEAPON,
        weaponType: WeaponType.SWORD,
        rarity: 'common',
        value: 50,
        stackable: false,
        maxStack: 1,
        damage: 18,
        attackSpeed: 1.0,
        range: 1,
        durability: 150,
        maxDurability: 150
      },
      {
        id: 'elven_bow',
        name: 'Elven Bow',
        description: 'A graceful bow crafted by ancient elves',
        type: ItemType.WEAPON,
        weaponType: WeaponType.BOW,
        rarity: 'uncommon',
        value: 120,
        stackable: false,
        maxStack: 1,
        damage: 15,
        attackSpeed: 1.5,
        range: 5,
        durability: 200,
        maxDurability: 200
      },
      {
        id: 'crystal_staff',
        name: 'Crystal Staff',
        description: 'A staff embedded with magical crystals',
        type: ItemType.WEAPON,
        weaponType: WeaponType.STAFF,
        rarity: 'rare',
        value: 200,
        stackable: false,
        maxStack: 1,
        damage: 25,
        attackSpeed: 0.8,
        range: 3,
        durability: 100,
        maxDurability: 100
      },
      {
        id: 'shadow_dagger',
        name: 'Shadow Dagger',
        description: 'A dagger infused with shadow magic',
        type: ItemType.WEAPON,
        weaponType: WeaponType.DAGGER,
        rarity: 'epic',
        value: 300,
        stackable: false,
        maxStack: 1,
        damage: 20,
        attackSpeed: 2.0,
        range: 1,
        durability: 120,
        maxDurability: 120
      }
    ];

    weapons.forEach(weapon => this.registerItem(weapon));
  }

  private static registerArmor(): void {
    const armor: ArmorItem[] = [
      {
        id: 'leather_helmet',
        name: 'Leather Helmet',
        description: 'Basic protection for the head',
        type: ItemType.ARMOR,
        armorType: ArmorType.HELMET,
        rarity: 'common',
        value: 25,
        stackable: false,
        maxStack: 1,
        defense: 3,
        durability: 100,
        maxDurability: 100
      },
      {
        id: 'iron_chestplate',
        name: 'Iron Chestplate',
        description: 'Sturdy iron armor for the torso',
        type: ItemType.ARMOR,
        armorType: ArmorType.CHESTPLATE,
        rarity: 'common',
        value: 80,
        stackable: false,
        maxStack: 1,
        defense: 12,
        durability: 150,
        maxDurability: 150
      },
      {
        id: 'chainmail_leggings',
        name: 'Chainmail Leggings',
        description: 'Flexible chainmail leg protection',
        type: ItemType.ARMOR,
        armorType: ArmorType.LEGGINGS,
        rarity: 'uncommon',
        value: 60,
        stackable: false,
        maxStack: 1,
        defense: 8,
        durability: 120,
        maxDurability: 120
      },
      {
        id: 'steel_boots',
        name: 'Steel Boots',
        description: 'Heavy steel boots for protection',
        type: ItemType.ARMOR,
        armorType: ArmorType.BOOTS,
        rarity: 'common',
        value: 40,
        stackable: false,
        maxStack: 1,
        defense: 5,
        durability: 130,
        maxDurability: 130
      },
      {
        id: 'tower_shield',
        name: 'Tower Shield',
        description: 'Large shield providing excellent protection',
        type: ItemType.ARMOR,
        armorType: ArmorType.SHIELD,
        rarity: 'uncommon',
        value: 100,
        stackable: false,
        maxStack: 1,
        defense: 15,
        durability: 200,
        maxDurability: 200
      }
    ];

    armor.forEach(armorPiece => this.registerItem(armorPiece));
  }

  private static registerConsumables(): void {
    const consumables: ConsumableItem[] = [
      {
        id: 'health_potion',
        name: 'Health Potion',
        description: 'Restores 50 health points',
        type: ItemType.CONSUMABLE,
        rarity: 'common',
        value: 15,
        stackable: true,
        maxStack: 10,
        effect: {
          health: 50
        }
      },
      {
        id: 'mana_potion',
        name: 'Mana Potion',
        description: 'Restores 30 mana points',
        type: ItemType.CONSUMABLE,
        rarity: 'common',
        value: 20,
        stackable: true,
        maxStack: 10,
        effect: {
          mana: 30
        }
      },
      {
        id: 'greater_health_potion',
        name: 'Greater Health Potion',
        description: 'Restores 100 health points',
        type: ItemType.CONSUMABLE,
        rarity: 'uncommon',
        value: 35,
        stackable: true,
        maxStack: 5,
        effect: {
          health: 100
        }
      }
    ];

    consumables.forEach(consumable => this.registerItem(consumable));
  }

  private static registerArtifacts(): void {
    const artifacts: ArtifactItem[] = [
      {
        id: 'ring_of_strength',
        name: 'Ring of Strength',
        description: 'Increases attack power permanently',
        type: ItemType.ARTIFACT,
        rarity: 'rare',
        value: 500,
        stackable: false,
        maxStack: 1,
        effects: {
          attack: 5
        }
      },
      {
        id: 'amulet_of_vitality',
        name: 'Amulet of Vitality',
        description: 'Increases maximum health',
        type: ItemType.ARTIFACT,
        rarity: 'rare',
        value: 600,
        stackable: false,
        maxStack: 1,
        effects: {
          maxHealth: 25
        }
      },
      {
        id: 'boots_of_speed',
        name: 'Boots of Speed',
        description: 'Increases movement speed',
        type: ItemType.ARTIFACT,
        rarity: 'epic',
        value: 800,
        stackable: false,
        maxStack: 1,
        effects: {
          speed: 2
        }
      }
    ];

    artifacts.forEach(artifact => this.registerItem(artifact));
  }

  public static createRandomLoot(level: number = 1): Item[] {
    const loot: Item[] = [];
    const allItems = this.getAllItems();
    
    // Higher level = better chance for rare items
    const rarityWeights = {
      common: Math.max(0.7 - level * 0.05, 0.3),
      uncommon: Math.min(0.2 + level * 0.02, 0.4),
      rare: Math.min(0.08 + level * 0.02, 0.2),
      epic: Math.min(0.02 + level * 0.01, 0.08),
      legendary: Math.min(level * 0.005, 0.02)
    };

    // Generate 1-3 items
    const itemCount = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < itemCount; i++) {
      const rand = Math.random();
      let cumulativeWeight = 0;
      let selectedRarity: string = 'common';

      for (const [rarity, weight] of Object.entries(rarityWeights)) {
        cumulativeWeight += weight;
        if (rand <= cumulativeWeight) {
          selectedRarity = rarity;
          break;
        }
      }

      const itemsOfRarity = allItems.filter(item => item.rarity === selectedRarity);
      if (itemsOfRarity.length > 0) {
        const randomItem = itemsOfRarity[Math.floor(Math.random() * itemsOfRarity.length)];
        loot.push(randomItem);
      }
    }

    return loot;
  }
}

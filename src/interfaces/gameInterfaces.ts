import type { Enemy } from '../game/entities/Enemy';
import type { Player } from '../game/entities/Player';
import type { Level } from '../game/levels/Level';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  readonly width: number;
  readonly height: number;
}

export interface GameObject {
  readonly position: Position;
  readonly size: Size;
  update(): void;
  render(ctx: CanvasRenderingContext2D): void;
}

export enum ItemType {
  RESOURCE = 'resource',
  WEAPON = 'weapon',
  ARMOR = 'armor',
  CONSUMABLE = 'consumable',
  ARTIFACT = 'artifact'
}

export enum ResourceType {
  ORE = 'ore',
  HERB = 'herb',
  GEM = 'gem',
  ESSENCE = 'essence'
}

export enum WeaponType {
  SWORD = 'sword',
  BOW = 'bow',
  STAFF = 'staff',
  DAGGER = 'dagger'
}

export enum ArmorType {
  HELMET = 'helmet',
  CHESTPLATE = 'chestplate',
  LEGGINGS = 'leggings',
  BOOTS = 'boots',
  SHIELD = 'shield'
}

export interface ItemBase {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly type: ItemType;
  readonly rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  readonly value: number;
  readonly stackable: boolean;
  readonly maxStack: number;
}

export interface ResourceItem extends ItemBase {
  readonly type: ItemType.RESOURCE;
  readonly resourceType: ResourceType;
}

export interface WeaponItem extends ItemBase {
  readonly type: ItemType.WEAPON;
  readonly weaponType: WeaponType;
  readonly damage: number;
  readonly attackSpeed: number;
  readonly range: number;
  readonly durability: number;
  readonly maxDurability: number;
}

export interface ArmorItem extends ItemBase {
  readonly type: ItemType.ARMOR;
  readonly armorType: ArmorType;
  readonly defense: number;
  readonly durability: number;
  readonly maxDurability: number;
}

export interface ConsumableItem extends ItemBase {
  readonly type: ItemType.CONSUMABLE;
  readonly effect: {
    readonly health?: number;
    readonly mana?: number;
    readonly duration?: number;
  };
}

export interface ArtifactItem extends ItemBase {
  readonly type: ItemType.ARTIFACT;
  readonly effects: Record<string, number>;
}

export type Item = ResourceItem | WeaponItem | ArmorItem | ConsumableItem | ArtifactItem;

export interface InventorySlot {
  item: Item | null;
  quantity: number;
}

export interface Equipment {
  weapon?: WeaponItem;
  helmet?: ArmorItem;
  chestplate?: ArmorItem;
  leggings?: ArmorItem;
  boots?: ArmorItem;
  shield?: ArmorItem;
}

export interface PlayerStats {
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  attack: number;
  defense: number;
  speed: number;
  level: number;
  experience: number;
  experienceToNext: number;
}

export interface EnemyStats {
  readonly health: number;
  readonly maxHealth: number;
  readonly damage: number;
  readonly speed: number;
  readonly detectionRadius: number;
  readonly attackRange: number;
  readonly attackCooldown: number;
  readonly experienceReward: number;
}

export enum EnemyType {
  GOBLIN = 'goblin',
  SKELETON = 'skeleton',
  SPIDER = 'spider',
  TROLL = 'troll'
}

export enum EnemyState {
  IDLE = 'idle',
  PATROLLING = 'patrolling',
  CHASING = 'chasing',
  ATTACKING = 'attacking',
  DEAD = 'dead'
}

export interface EnemyAI {
  update(enemy: Enemy, player: Player, level: Level): void;
  getState(): EnemyState;
  reset(): void;
}

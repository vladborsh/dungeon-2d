import type { Item, InventorySlot, Equipment, WeaponItem, ArmorItem } from '../../interfaces/gameInterfaces';
import { ArmorType, WeaponType } from '../../interfaces/gameInterfaces';

export interface InventoryChangeEvent {
  readonly type: 'add' | 'remove' | 'equip' | 'unequip';
  readonly item: Item;
  readonly quantity: number;
  readonly slotIndex?: number;
}

export class Inventory {
  private readonly slots: InventorySlot[];
  private readonly maxSlots: number;
  private equipment: Equipment;
  private readonly eventListeners: Array<(event: InventoryChangeEvent) => void>;

  public constructor(maxSlots: number = 30) {
    this.maxSlots = maxSlots;
    this.slots = Array.from({ length: maxSlots }, () => ({ item: null, quantity: 0 }));
    this.equipment = {};
    this.eventListeners = [];
  }

  public getSlots(): readonly InventorySlot[] {
    return this.slots;
  }

  public getEquipment(): Equipment {
    return { ...this.equipment };
  }

  public addEventListener(listener: (event: InventoryChangeEvent) => void): void {
    this.eventListeners.push(listener);
  }

  public removeEventListener(listener: (event: InventoryChangeEvent) => void): void {
    const index = this.eventListeners.indexOf(listener);
    if (index !== -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  private notifyListeners(event: InventoryChangeEvent): void {
    this.eventListeners.forEach(listener => listener(event));
  }

  public addItem(item: Item, quantity: number = 1): boolean {
    if (quantity <= 0) return false;

    // If item is stackable, try to add to existing stacks first
    if (item.stackable) {
      for (let i = 0; i < this.slots.length; i++) {
        const slot = this.slots[i];
        if (slot.item?.id === item.id) {
          const spaceAvailable = item.maxStack - slot.quantity;
          const toAdd = Math.min(quantity, spaceAvailable);
          
          if (toAdd > 0) {
            slot.quantity += toAdd;
            quantity -= toAdd;
            
            this.notifyListeners({
              type: 'add',
              item,
              quantity: toAdd,
              slotIndex: i
            });

            if (quantity === 0) return true;
          }
        }
      }
    }

    // Add to empty slots
    while (quantity > 0) {
      const emptySlot = this.findEmptySlot();
      if (emptySlot === -1) return false; // Inventory full

      const slot = this.slots[emptySlot];
      const toAdd = item.stackable ? Math.min(quantity, item.maxStack) : 1;
      
      slot.item = item;
      slot.quantity = toAdd;
      quantity -= toAdd;

      this.notifyListeners({
        type: 'add',
        item,
        quantity: toAdd,
        slotIndex: emptySlot
      });
    }

    return true;
  }

  public removeItem(itemId: string, quantity: number = 1): boolean {
    if (quantity <= 0) return false;

    let remaining = quantity;

    for (let i = 0; i < this.slots.length; i++) {
      const slot = this.slots[i];
      if (slot.item?.id === itemId) {
        const toRemove = Math.min(remaining, slot.quantity);
        slot.quantity -= toRemove;
        remaining -= toRemove;

        this.notifyListeners({
          type: 'remove',
          item: slot.item,
          quantity: toRemove,
          slotIndex: i
        });

        if (slot.quantity === 0) {
          slot.item = null;
        }

        if (remaining === 0) return true;
      }
    }

    return remaining < quantity; // Return true if at least some items were removed
  }

  public getItemCount(itemId: string): number {
    return this.slots.reduce((count, slot) => {
      if (slot.item?.id === itemId) {
        return count + slot.quantity;
      }
      return count;
    }, 0);
  }

  public hasItem(itemId: string, quantity: number = 1): boolean {
    return this.getItemCount(itemId) >= quantity;
  }

  public equipItem(slotIndex: number): boolean {
    const slot = this.slots[slotIndex];
    if (!slot.item) return false;

    const item = slot.item;
    
    if (item.type === 'weapon') {
      return this.equipWeapon(item as WeaponItem, slotIndex);
    } else if (item.type === 'armor') {
      return this.equipArmor(item as ArmorItem, slotIndex);
    }

    return false;
  }

  private equipWeapon(weapon: WeaponItem, slotIndex: number): boolean {
    const currentWeapon = this.equipment.weapon;
    
    // Unequip current weapon if any
    if (currentWeapon) {
      if (!this.addItem(currentWeapon, 1)) {
        return false; // Can't unequip if inventory is full
      }
    }

    // Equip new weapon
    this.equipment.weapon = weapon;
    this.removeItemFromSlot(slotIndex, 1);

    this.notifyListeners({
      type: 'equip',
      item: weapon,
      quantity: 1
    });

    return true;
  }

  private equipArmor(armor: ArmorItem, slotIndex: number): boolean {
    const armorSlot = this.getArmorSlot(armor.armorType);
    if (!armorSlot) return false;

    const currentArmor = this.equipment[armorSlot];
    
    // Unequip current armor if any
    if (currentArmor) {
      if (!this.addItem(currentArmor, 1)) {
        return false; // Can't unequip if inventory is full
      }
    }

    // Equip new armor
    (this.equipment as any)[armorSlot] = armor;
    this.removeItemFromSlot(slotIndex, 1);

    this.notifyListeners({
      type: 'equip',
      item: armor,
      quantity: 1
    });

    return true;
  }

  public unequipItem(equipmentSlot: keyof Equipment): boolean {
    const item = this.equipment[equipmentSlot];
    if (!item) return false;

    if (!this.addItem(item, 1)) {
      return false; // Can't unequip if inventory is full
    }

    (this.equipment as any)[equipmentSlot] = undefined;

    this.notifyListeners({
      type: 'unequip',
      item,
      quantity: 1
    });

    return true;
  }

  private getArmorSlot(armorType: ArmorType): keyof Equipment | null {
    switch (armorType) {
      case 'helmet':
        return 'helmet';
      case 'chestplate':
        return 'chestplate';
      case 'leggings':
        return 'leggings';
      case 'boots':
        return 'boots';
      case 'shield':
        return 'shield';
      default:
        return null;
    }
  }

  private removeItemFromSlot(slotIndex: number, quantity: number): void {
    const slot = this.slots[slotIndex];
    if (!slot.item) return;

    slot.quantity -= quantity;
    if (slot.quantity <= 0) {
      slot.item = null;
      slot.quantity = 0;
    }
  }

  private findEmptySlot(): number {
    for (let i = 0; i < this.slots.length; i++) {
      if (!this.slots[i].item) {
        return i;
      }
    }
    return -1;
  }

  public moveItem(fromSlot: number, toSlot: number): boolean {
    if (fromSlot === toSlot || fromSlot < 0 || fromSlot >= this.slots.length || 
        toSlot < 0 || toSlot >= this.slots.length) {
      return false;
    }

    const fromSlotData = this.slots[fromSlot];
    const toSlotData = this.slots[toSlot];

    if (!fromSlotData.item) return false;

    // If target slot is empty, move the entire stack
    if (!toSlotData.item) {
      this.slots[toSlot] = { ...fromSlotData };
      this.slots[fromSlot] = { item: null, quantity: 0 };
      return true;
    }

    // If same item and stackable, try to merge
    if (toSlotData.item.id === fromSlotData.item.id && toSlotData.item.stackable) {
      const spaceAvailable = toSlotData.item.maxStack - toSlotData.quantity;
      const toMove = Math.min(fromSlotData.quantity, spaceAvailable);

      if (toMove > 0) {
        toSlotData.quantity += toMove;
        fromSlotData.quantity -= toMove;

        if (fromSlotData.quantity === 0) {
          fromSlotData.item = null;
        }
        return true;
      }
    }

    // Otherwise, swap the slots
    const temp = { ...fromSlotData };
    this.slots[fromSlot] = { ...toSlotData };
    this.slots[toSlot] = temp;

    return true;
  }

  public getEquippedStats(): { attack: number; defense: number; speed: number } {
    let attack = 0;
    let defense = 0;
    let speed = 0;

    if (this.equipment.weapon) {
      attack += this.equipment.weapon.damage;
    }

    const armorPieces: (ArmorItem | undefined)[] = [
      this.equipment.helmet,
      this.equipment.chestplate,
      this.equipment.leggings,
      this.equipment.boots,
      this.equipment.shield
    ];

    armorPieces.forEach(armor => {
      if (armor) {
        defense += armor.defense;
      }
    });

    return { attack, defense, speed };
  }

  public serialize(): string {
    return JSON.stringify({
      slots: this.slots,
      equipment: this.equipment
    });
  }

  public deserialize(data: string): void {
    try {
      const parsed = JSON.parse(data);
      
      // Clear current inventory
      this.slots.fill({ item: null, quantity: 0 });
      this.equipment = {};

      // Restore slots
      if (parsed.slots && Array.isArray(parsed.slots)) {
        parsed.slots.forEach((slot: InventorySlot, index: number) => {
          if (index < this.slots.length) {
            this.slots[index] = slot;
          }
        });
      }

      // Restore equipment
      if (parsed.equipment) {
        this.equipment = parsed.equipment;
      }
    } catch (error) {
      console.error('Failed to deserialize inventory:', error);
    }
  }
}

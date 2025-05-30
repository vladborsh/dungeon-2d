import type { Item, InventorySlot, Equipment } from '../../interfaces/gameInterfaces';
import type { Inventory } from '../../game/systems/Inventory';
import { GAME_CONSTANTS } from '../../constants/gameConstants';

export interface InventoryUIConfig {
  readonly containerId: string;
  readonly slotSize: number;
  readonly slotsPerRow: number;
  readonly padding: number;
}

export class InventoryUI {
  private readonly config: InventoryUIConfig;
  private inventory: Inventory | null;
  private isVisible: boolean;
  private selectedSlot: number;
  private readonly hotbarSlots: number;
  private readonly inventoryContainer: HTMLElement | null;

  public constructor(config: InventoryUIConfig) {
    this.config = config;
    this.inventory = null;
    this.isVisible = false;
    this.selectedSlot = -1;
    this.hotbarSlots = GAME_CONSTANTS.INVENTORY.HOTBAR_SLOTS;
    this.inventoryContainer = document.getElementById(config.containerId);
    
    this.initializeHTML();
  }

  private initializeHTML(): void {
    if (!this.inventoryContainer) return;
    
    // Create hotbar container
    const hotbarContainer = document.createElement('div');
    hotbarContainer.id = 'hotbar-container';
    hotbarContainer.className = 'hotbar-container';
    hotbarContainer.innerHTML = `
      <div class="hotbar-title">Hotbar</div>
      <div id="hotbar-slots" class="hotbar-slots"></div>
    `;
    
    // Create full inventory container (initially hidden)
    const fullInventoryContainer = document.createElement('div');
    fullInventoryContainer.id = 'full-inventory-container';
    fullInventoryContainer.className = 'full-inventory-container';
    fullInventoryContainer.style.display = 'none';
    fullInventoryContainer.innerHTML = `
      <div class="inventory-panel">
        <div class="inventory-title">Inventory</div>
        <div id="inventory-slots" class="inventory-slots"></div>
      </div>
      <div class="equipment-panel">
        <div class="equipment-title">Equipment</div>
        <div id="equipment-slots" class="equipment-slots"></div>
      </div>
    `;
    
    this.inventoryContainer.appendChild(hotbarContainer);
    this.inventoryContainer.appendChild(fullInventoryContainer);
    
    // Add CSS styles
    this.addStyles();
  }

  private addStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      .hotbar-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
      }
      
      .hotbar-title {
        color: #00FF00;
        font-size: 14px;
        font-weight: bold;
      }
      
      .hotbar-slots {
        display: flex;
        gap: 4px;
        background-color: rgba(0, 0, 0, 0.7);
        padding: 8px;
        border-radius: 6px;
        border: 2px solid #555;
      }
      
      .full-inventory-container {
        display: flex;
        gap: 20px;
        justify-content: center;
        margin-top: 10px;
      }
      
      .inventory-panel, .equipment-panel {
        background-color: rgba(45, 45, 45, 0.95);
        border: 2px solid #555;
        border-radius: 6px;
        padding: 10px;
      }
      
      .inventory-title, .equipment-title {
        color: #00FF00;
        font-size: 14px;
        font-weight: bold;
        text-align: center;
        margin-bottom: 10px;
        border-bottom: 1px solid #333;
        padding-bottom: 5px;
      }
      
      .inventory-slots {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: 4px;
      }
      
      .equipment-slots {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(4, 1fr);
        gap: 4px;
        width: 120px;
      }
      
      .inventory-slot {
        width: 32px;
        height: 32px;
        background-color: #2D2D2D;
        border: 2px solid #555;
        border-radius: 3px;
        position: relative;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: border-color 0.2s ease;
      }
      
      .inventory-slot:hover {
        border-color: #777;
      }
      
      .inventory-slot.selected {
        border-color: #FFFF00;
        box-shadow: 0 0 8px rgba(255, 255, 0, 0.5);
      }
      
      .inventory-slot.has-item {
        border-color: #888;
      }
      
      .slot-item {
        width: 24px;
        height: 24px;
        border-radius: 2px;
        border: 1px solid #000;
      }
      
      .slot-quantity {
        position: absolute;
        bottom: 2px;
        right: 2px;
        color: #fff;
        font-size: 8px;
        font-weight: bold;
        text-shadow: 1px 1px 1px #000;
        pointer-events: none;
      }
      
      .slot-number {
        position: absolute;
        top: -15px;
        left: 50%;
        transform: translateX(-50%);
        color: #fff;
        font-size: 12px;
        font-weight: bold;
      }
      
      .durability-bar {
        position: absolute;
        bottom: 2px;
        left: 2px;
        right: 2px;
        height: 2px;
        background-color: #333;
        border-radius: 1px;
      }
      
      .durability-fill {
        height: 100%;
        border-radius: 1px;
        transition: width 0.3s ease;
      }
      
      .durability-high { background-color: #00FF00; }
      .durability-medium { background-color: #FFFF00; }
      .durability-low { background-color: #FF0000; }
      
      .item-common { background-color: #FFFFFF; }
      .item-uncommon { background-color: #00FF00; }
      .item-rare { background-color: #0080FF; }
      .item-epic { background-color: #8000FF; }
      .item-legendary { background-color: #FF8000; }
      
      .item-weapon { background-color: #FF6B35; }
      .item-armor { background-color: #4169E1; }
      .item-resource { background-color: #8B4513; }
      .item-consumable { background-color: #32CD32; }
      .item-artifact { background-color: #FFD700; }
    `;
    document.head.appendChild(style);
  }

  public setInventory(inventory: Inventory): void {
    this.inventory = inventory;
    this.render();
  }

  public setVisible(visible: boolean): void {
    this.isVisible = visible;
    const fullInventoryContainer = document.getElementById('full-inventory-container');
    if (fullInventoryContainer) {
      fullInventoryContainer.style.display = visible ? 'flex' : 'none';
    }
  }

  public toggle(): void {
    this.setVisible(!this.isVisible);
  }

  public handleClick(element: HTMLElement): boolean {
    if (!this.inventory) return false;
    
    const slotIndex = parseInt(element.dataset.slotIndex || '-1');
    if (slotIndex !== -1) {
      this.selectedSlot = slotIndex;
      
      // Try to equip item if it's equipment
      const slot = this.inventory.getSlots()[slotIndex];
      if (slot.item && (slot.item.type === 'weapon' || slot.item.type === 'armor')) {
        this.inventory.equipItem(slotIndex);
      }
      
      this.render();
      return true;
    }
    
    return false;
  }

  public render(): void {
    if (!this.inventory) return;
    
    this.renderHotbar();
    if (this.isVisible) {
      this.renderFullInventory();
      this.renderEquipment();
    }
  }

  private renderHotbar(): void {
    const hotbarSlotsContainer = document.getElementById('hotbar-slots');
    if (!hotbarSlotsContainer || !this.inventory) return;
    
    const slots = this.inventory.getSlots();
    hotbarSlotsContainer.innerHTML = '';
    
    for (let i = 0; i < this.hotbarSlots; i++) {
      const slot = slots[i];
      const slotElement = this.createSlotElement(slot, i, i === this.selectedSlot);
      
      // Add slot number
      const slotNumber = document.createElement('div');
      slotNumber.className = 'slot-number';
      slotNumber.textContent = (i + 1).toString();
      slotElement.appendChild(slotNumber);
      
      hotbarSlotsContainer.appendChild(slotElement);
    }
  }

  private renderFullInventory(): void {
    const inventorySlotsContainer = document.getElementById('inventory-slots');
    if (!inventorySlotsContainer || !this.inventory) return;
    
    const slots = this.inventory.getSlots();
    inventorySlotsContainer.innerHTML = '';
    
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      const slotElement = this.createSlotElement(slot, i, i === this.selectedSlot);
      inventorySlotsContainer.appendChild(slotElement);
    }
  }

  private renderEquipment(): void {
    const equipmentSlotsContainer = document.getElementById('equipment-slots');
    if (!equipmentSlotsContainer || !this.inventory) return;
    
    const equipment = this.inventory.getEquipment();
    equipmentSlotsContainer.innerHTML = '';
    
    const equipmentSlots = [
      { key: 'helmet' as keyof Equipment, position: 1 },
      { key: 'chestplate' as keyof Equipment, position: 4 },
      { key: 'leggings' as keyof Equipment, position: 7 },
      { key: 'boots' as keyof Equipment, position: 10 },
      { key: 'weapon' as keyof Equipment, position: 3 },
      { key: 'shield' as keyof Equipment, position: 5 }
    ];
    
    // Create 12 slots (3x4 grid)
    for (let i = 0; i < 12; i++) {
      const equipSlot = equipmentSlots.find(slot => slot.position === i);
      if (equipSlot) {
        const item = equipment[equipSlot.key];
        const slot: InventorySlot = { item: item || null, quantity: item ? 1 : 0 };
        const slotElement = this.createSlotElement(slot, -1, false);
        slotElement.title = equipSlot.key.charAt(0).toUpperCase() + equipSlot.key.slice(1);
        equipmentSlotsContainer.appendChild(slotElement);
      } else {
        // Empty slot
        const emptySlot = document.createElement('div');
        emptySlot.className = 'inventory-slot';
        equipmentSlotsContainer.appendChild(emptySlot);
      }
    }
  }

  private createSlotElement(slot: InventorySlot, index: number, selected: boolean): HTMLElement {
    const slotElement = document.createElement('div');
    slotElement.className = `inventory-slot${selected ? ' selected' : ''}${slot.item ? ' has-item' : ''}`;
    slotElement.dataset.slotIndex = index.toString();
    
    if (slot.item) {
      // Create item visual
      const itemElement = document.createElement('div');
      itemElement.className = 'slot-item';
      
      // Add rarity class
      itemElement.classList.add(`item-${slot.item.rarity}`);
      
      // Add type class for additional coloring
      itemElement.classList.add(`item-${slot.item.type}`);
      
      slotElement.appendChild(itemElement);
      
      // Add quantity if stackable and > 1
      if (slot.item.stackable && slot.quantity > 1) {
        const quantityElement = document.createElement('div');
        quantityElement.className = 'slot-quantity';
        quantityElement.textContent = slot.quantity.toString();
        slotElement.appendChild(quantityElement);
      }
      
      // Add durability bar for equipment
      if ((slot.item.type === 'weapon' || slot.item.type === 'armor') && 'durability' in slot.item) {
        const durabilityPercent = slot.item.durability / slot.item.maxDurability;
        
        const durabilityBar = document.createElement('div');
        durabilityBar.className = 'durability-bar';
        
        const durabilityFill = document.createElement('div');
        durabilityFill.className = 'durability-fill';
        durabilityFill.style.width = `${durabilityPercent * 100}%`;
        
        if (durabilityPercent > 0.66) {
          durabilityFill.classList.add('durability-high');
        } else if (durabilityPercent > 0.33) {
          durabilityFill.classList.add('durability-medium');
        } else {
          durabilityFill.classList.add('durability-low');
        }
        
        durabilityBar.appendChild(durabilityFill);
        slotElement.appendChild(durabilityBar);
      }
      
      // Add tooltip
      slotElement.title = `${slot.item.name} (${slot.item.rarity})${slot.item.description ? '\n' + slot.item.description : ''}`;
    }
    
    // Add click handler
    slotElement.addEventListener('click', () => this.handleClick(slotElement));
    
    return slotElement;
  }

  public selectHotbarSlot(slotNumber: number): void {
    if (slotNumber >= 1 && slotNumber <= this.hotbarSlots) {
      this.selectedSlot = slotNumber - 1;
      this.render();
    }
  }

  public getSelectedItem(): Item | null {
    if (!this.inventory || this.selectedSlot === -1) return null;
    
    const slots = this.inventory.getSlots();
    return slots[this.selectedSlot]?.item || null;
  }
}

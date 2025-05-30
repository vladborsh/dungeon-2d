import type { Item, InventorySlot, Equipment } from '../../interfaces/gameInterfaces';
import type { Inventory } from '../../game/systems/Inventory';
import { GAME_CONSTANTS } from '../../constants/gameConstants';

export interface InventoryUIConfig {
  readonly x: number;
  readonly y: number;
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

  public constructor(config: InventoryUIConfig) {
    this.config = config;
    this.inventory = null;
    this.isVisible = false;
    this.selectedSlot = -1;
    this.hotbarSlots = GAME_CONSTANTS.INVENTORY.HOTBAR_SLOTS;
  }

  public setInventory(inventory: Inventory): void {
    this.inventory = inventory;
  }

  public setVisible(visible: boolean): void {
    this.isVisible = visible;
  }

  public toggle(): void {
    this.isVisible = !this.isVisible;
  }

  public handleClick(mouseX: number, mouseY: number): boolean {
    if (!this.isVisible || !this.inventory) return false;

    const slotIndex = this.getSlotAtPosition(mouseX, mouseY);
    if (slotIndex !== -1) {
      this.selectedSlot = slotIndex;
      
      // Try to equip item if it's equipment
      const slot = this.inventory.getSlots()[slotIndex];
      if (slot.item && (slot.item.type === 'weapon' || slot.item.type === 'armor')) {
        this.inventory.equipItem(slotIndex);
      }
      
      return true;
    }

    return false;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.inventory) return;

    this.renderHotbar(ctx);

    if (this.isVisible) {
      this.renderFullInventory(ctx);
      this.renderEquipment(ctx);
    }
  }

  private renderHotbar(ctx: CanvasRenderingContext2D): void {
    const slots = this.inventory!.getSlots();
    const hotbarY = ctx.canvas.height - this.config.slotSize - 20;
    const hotbarStartX = (ctx.canvas.width - (this.hotbarSlots * (this.config.slotSize + this.config.padding))) / 2;

    // Render hotbar background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(
      hotbarStartX - this.config.padding,
      hotbarY - this.config.padding,
      this.hotbarSlots * (this.config.slotSize + this.config.padding) + this.config.padding,
      this.config.slotSize + this.config.padding * 2
    );

    // Render hotbar slots
    for (let i = 0; i < this.hotbarSlots; i++) {
      const x = hotbarStartX + i * (this.config.slotSize + this.config.padding);
      const slot = slots[i];
      
      this.renderSlot(ctx, x, hotbarY, slot, i === this.selectedSlot);
      
      // Render slot number
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        (i + 1).toString(),
        x + this.config.slotSize / 2,
        hotbarY - 5
      );
    }
  }

  private renderFullInventory(ctx: CanvasRenderingContext2D): void {
    const slots = this.inventory!.getSlots();
    
    // Calculate inventory panel dimensions
    const rows = Math.ceil(slots.length / this.config.slotsPerRow);
    const panelWidth = this.config.slotsPerRow * (this.config.slotSize + this.config.padding) + this.config.padding;
    const panelHeight = rows * (this.config.slotSize + this.config.padding) + this.config.padding + 30; // +30 for title

    // Center the inventory panel
    const panelX = (ctx.canvas.width - panelWidth) / 2;
    const panelY = (ctx.canvas.height - panelHeight) / 2;

    // Render panel background
    ctx.fillStyle = 'rgba(45, 45, 45, 0.95)';
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

    // Render panel border
    ctx.strokeStyle = GAME_CONSTANTS.ITEMS.COLORS.BORDER;
    ctx.lineWidth = 2;
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

    // Render title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Inventory', panelX + panelWidth / 2, panelY + 20);

    // Render inventory slots
    for (let i = 0; i < slots.length; i++) {
      const row = Math.floor(i / this.config.slotsPerRow);
      const col = i % this.config.slotsPerRow;
      
      const x = panelX + this.config.padding + col * (this.config.slotSize + this.config.padding);
      const y = panelY + 30 + this.config.padding + row * (this.config.slotSize + this.config.padding);
      
      this.renderSlot(ctx, x, y, slots[i], i === this.selectedSlot);
    }
  }

  private renderEquipment(ctx: CanvasRenderingContext2D): void {
    const equipment = this.inventory!.getEquipment();
    const equipmentPanelX = 50;
    const equipmentPanelY = 50;
    const equipmentSlots = [
      { key: 'helmet' as keyof Equipment, x: 1, y: 0 },
      { key: 'chestplate' as keyof Equipment, x: 1, y: 1 },
      { key: 'leggings' as keyof Equipment, x: 1, y: 2 },
      { key: 'boots' as keyof Equipment, x: 1, y: 3 },
      { key: 'weapon' as keyof Equipment, x: 0, y: 1 },
      { key: 'shield' as keyof Equipment, x: 2, y: 1 }
    ];

    // Render equipment panel background
    const panelWidth = 3 * (this.config.slotSize + this.config.padding) + this.config.padding;
    const panelHeight = 4 * (this.config.slotSize + this.config.padding) + this.config.padding + 30;
    
    ctx.fillStyle = 'rgba(45, 45, 45, 0.95)';
    ctx.fillRect(equipmentPanelX, equipmentPanelY, panelWidth, panelHeight);

    ctx.strokeStyle = GAME_CONSTANTS.ITEMS.COLORS.BORDER;
    ctx.lineWidth = 2;
    ctx.strokeRect(equipmentPanelX, equipmentPanelY, panelWidth, panelHeight);

    // Render title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Equipment', equipmentPanelX + panelWidth / 2, equipmentPanelY + 20);

    // Render equipment slots
    equipmentSlots.forEach(slotInfo => {
      const x = equipmentPanelX + this.config.padding + slotInfo.x * (this.config.slotSize + this.config.padding);
      const y = equipmentPanelY + 30 + this.config.padding + slotInfo.y * (this.config.slotSize + this.config.padding);
      
      const item = equipment[slotInfo.key];
      const slot: InventorySlot = { item: item || null, quantity: item ? 1 : 0 };
      
      this.renderSlot(ctx, x, y, slot, false);
    });
  }

  private renderSlot(ctx: CanvasRenderingContext2D, x: number, y: number, slot: InventorySlot, selected: boolean): void {
    // Render slot background
    ctx.fillStyle = selected ? GAME_CONSTANTS.ITEMS.COLORS.SELECTED : GAME_CONSTANTS.ITEMS.COLORS.BACKGROUND;
    ctx.fillRect(x, y, this.config.slotSize, this.config.slotSize);

    // Render slot border
    ctx.strokeStyle = selected ? GAME_CONSTANTS.ITEMS.COLORS.SELECTED : GAME_CONSTANTS.ITEMS.COLORS.BORDER;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, this.config.slotSize, this.config.slotSize);

    if (slot.item) {
      // Render item (simplified representation)
      const itemColor = this.getItemColor(slot.item);
      ctx.fillStyle = itemColor;
      ctx.fillRect(x + 4, y + 4, this.config.slotSize - 8, this.config.slotSize - 8);

      // Render item border
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 4, y + 4, this.config.slotSize - 8, this.config.slotSize - 8);

      // Render quantity if stackable and > 1
      if (slot.item.stackable && slot.quantity > 1) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '10px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(
          slot.quantity.toString(),
          x + this.config.slotSize - 2,
          y + this.config.slotSize - 2
        );
      }

      // Render durability bar for equipment
      if ((slot.item.type === 'weapon' || slot.item.type === 'armor') && 'durability' in slot.item) {
        const durabilityPercent = slot.item.durability / slot.item.maxDurability;
        const barWidth = this.config.slotSize - 8;
        const barHeight = 2;
        
        // Background
        ctx.fillStyle = '#333333';
        ctx.fillRect(x + 4, y + this.config.slotSize - 6, barWidth, barHeight);
        
        // Durability bar
        ctx.fillStyle = durabilityPercent > 0.5 ? '#00FF00' : durabilityPercent > 0.25 ? '#FFFF00' : '#FF0000';
        ctx.fillRect(x + 4, y + this.config.slotSize - 6, barWidth * durabilityPercent, barHeight);
      }
    }
  }

  private getItemColor(item: Item): string {
    // Base color by type
    let baseColor: string;
    switch (item.type) {
      case 'weapon':
        baseColor = '#8B4513'; // Brown
        break;
      case 'armor':
        baseColor = '#696969'; // Gray
        break;
      case 'resource':
        baseColor = '#228B22'; // Green
        break;
      case 'consumable':
        baseColor = '#4169E1'; // Blue
        break;
      case 'artifact':
        baseColor = '#FFD700'; // Gold
        break;
      default:
        baseColor = '#FFFFFF';
    }

    return baseColor;
  }

  private getSlotAtPosition(mouseX: number, mouseY: number): number {
    if (!this.isVisible || !this.inventory) return -1;

    const slots = this.inventory.getSlots();
    const rows = Math.ceil(slots.length / this.config.slotsPerRow);
    const panelWidth = this.config.slotsPerRow * (this.config.slotSize + this.config.padding) + this.config.padding;
    const panelHeight = rows * (this.config.slotSize + this.config.padding) + this.config.padding + 30;

    const panelX = (800 - panelWidth) / 2; // Assuming canvas width 800
    const panelY = (600 - panelHeight) / 2; // Assuming canvas height 600

    for (let i = 0; i < slots.length; i++) {
      const row = Math.floor(i / this.config.slotsPerRow);
      const col = i % this.config.slotsPerRow;
      
      const x = panelX + this.config.padding + col * (this.config.slotSize + this.config.padding);
      const y = panelY + 30 + this.config.padding + row * (this.config.slotSize + this.config.padding);
      
      if (mouseX >= x && mouseX <= x + this.config.slotSize &&
          mouseY >= y && mouseY <= y + this.config.slotSize) {
        return i;
      }
    }

    return -1;
  }

  public selectHotbarSlot(slotNumber: number): void {
    if (slotNumber >= 1 && slotNumber <= this.hotbarSlots) {
      this.selectedSlot = slotNumber - 1;
    }
  }

  public getSelectedItem(): Item | null {
    if (!this.inventory || this.selectedSlot === -1) return null;
    
    const slots = this.inventory.getSlots();
    return slots[this.selectedSlot]?.item || null;
  }
}

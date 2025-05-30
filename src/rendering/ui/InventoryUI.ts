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
    const hotbarY = ctx.canvas.height - this.config.slotSize - GAME_CONSTANTS.UI.INVENTORY.HOTBAR.BOTTOM_MARGIN;
    const hotbarStartX = (ctx.canvas.width - (this.hotbarSlots * (this.config.slotSize + this.config.padding))) / 2;

    // Render hotbar background
    ctx.fillStyle = GAME_CONSTANTS.UI.INVENTORY.HOTBAR.BACKGROUND_COLOR;
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
      ctx.fillStyle = GAME_CONSTANTS.UI.INVENTORY.HOTBAR.TEXT_COLOR;
      ctx.font = GAME_CONSTANTS.UI.INVENTORY.HOTBAR.TEXT_FONT;
      ctx.textAlign = 'center';
      ctx.fillText(
        (i + 1).toString(),
        x + this.config.slotSize / 2,
        hotbarY - GAME_CONSTANTS.UI.INVENTORY.HOTBAR.TEXT_OFFSET
      );
    }
  }

  private renderFullInventory(ctx: CanvasRenderingContext2D): void {
    const slots = this.inventory!.getSlots();
    
    // Calculate inventory panel dimensions
    const rows = Math.ceil(slots.length / this.config.slotsPerRow);
    const panelWidth = this.config.slotsPerRow * (this.config.slotSize + this.config.padding) + this.config.padding;
    const panelHeight = rows * (this.config.slotSize + this.config.padding) + this.config.padding + GAME_CONSTANTS.UI.INVENTORY.PANEL.TITLE_HEIGHT;

    // Position inventory panel in the right UI area, below player info
    const panelX = GAME_CONSTANTS.CANVAS.WIDTH - panelWidth - 10;
    const panelY = 200; // Position below player info panel

    // Render panel background
    ctx.fillStyle = GAME_CONSTANTS.UI.INVENTORY.PANEL.BACKGROUND_COLOR;
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

    // Render panel border
    ctx.strokeStyle = GAME_CONSTANTS.ITEMS.COLORS.BORDER;
    ctx.lineWidth = GAME_CONSTANTS.UI.INVENTORY.PANEL.BORDER_WIDTH;
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

    // Render title
    ctx.fillStyle = GAME_CONSTANTS.UI.INVENTORY.PANEL.TITLE_COLOR;
    ctx.font = GAME_CONSTANTS.UI.INVENTORY.PANEL.TITLE_FONT;
    ctx.textAlign = 'center';
    ctx.fillText('Inventory', panelX + panelWidth / 2, panelY + GAME_CONSTANTS.UI.INVENTORY.PANEL.TITLE_OFFSET);

    // Render inventory slots
    for (let i = 0; i < slots.length; i++) {
      const row = Math.floor(i / this.config.slotsPerRow);
      const col = i % this.config.slotsPerRow;
      
      const x = panelX + this.config.padding + col * (this.config.slotSize + this.config.padding);
      const y = panelY + GAME_CONSTANTS.UI.INVENTORY.PANEL.TITLE_HEIGHT + this.config.padding + row * (this.config.slotSize + this.config.padding);
      
      this.renderSlot(ctx, x, y, slots[i], i === this.selectedSlot);
    }
  }

  private renderEquipment(ctx: CanvasRenderingContext2D): void {
    const equipment = this.inventory!.getEquipment();
    
    // Position equipment panel in the right UI area, below inventory
    const panelWidth = GAME_CONSTANTS.UI.INVENTORY.EQUIPMENT.GRID_COLS * (this.config.slotSize + this.config.padding) + this.config.padding;
    const panelHeight = GAME_CONSTANTS.UI.INVENTORY.EQUIPMENT.GRID_ROWS * (this.config.slotSize + this.config.padding) + this.config.padding + GAME_CONSTANTS.UI.INVENTORY.PANEL.TITLE_HEIGHT;
    
    const equipmentPanelX = GAME_CONSTANTS.CANVAS.WIDTH - panelWidth - 10;
    const equipmentPanelY = 400; // Position below inventory
    
    const equipmentSlots = [
      { key: 'helmet' as keyof Equipment, x: 1, y: 0 },
      { key: 'chestplate' as keyof Equipment, x: 1, y: 1 },
      { key: 'leggings' as keyof Equipment, x: 1, y: 2 },
      { key: 'boots' as keyof Equipment, x: 1, y: 3 },
      { key: 'weapon' as keyof Equipment, x: 0, y: 1 },
      { key: 'shield' as keyof Equipment, x: 2, y: 1 }
    ];

    // Render equipment panel background
    ctx.fillStyle = GAME_CONSTANTS.UI.INVENTORY.PANEL.BACKGROUND_COLOR;
    ctx.fillRect(equipmentPanelX, equipmentPanelY, panelWidth, panelHeight);

    ctx.strokeStyle = GAME_CONSTANTS.ITEMS.COLORS.BORDER;
    ctx.lineWidth = GAME_CONSTANTS.UI.INVENTORY.PANEL.BORDER_WIDTH;
    ctx.strokeRect(equipmentPanelX, equipmentPanelY, panelWidth, panelHeight);

    // Render title
    ctx.fillStyle = GAME_CONSTANTS.UI.INVENTORY.PANEL.TITLE_COLOR;
    ctx.font = GAME_CONSTANTS.UI.INVENTORY.PANEL.TITLE_FONT;
    ctx.textAlign = 'center';
    ctx.fillText('Equipment', equipmentPanelX + panelWidth / 2, equipmentPanelY + GAME_CONSTANTS.UI.INVENTORY.PANEL.TITLE_OFFSET);

    // Render equipment slots
    equipmentSlots.forEach(slotInfo => {
      const x = equipmentPanelX + this.config.padding + slotInfo.x * (this.config.slotSize + this.config.padding);
      const y = equipmentPanelY + GAME_CONSTANTS.UI.INVENTORY.PANEL.TITLE_HEIGHT + this.config.padding + slotInfo.y * (this.config.slotSize + this.config.padding);
      
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
    ctx.lineWidth = GAME_CONSTANTS.UI.INVENTORY.SLOT.ITEM_BORDER_WIDTH;
    ctx.strokeRect(x, y, this.config.slotSize, this.config.slotSize);

    if (slot.item) {
      // Render item (simplified representation)
      const itemColor = this.getItemColor(slot.item);
      ctx.fillStyle = itemColor;
      const itemMargin = GAME_CONSTANTS.UI.INVENTORY.SLOT.ITEM_MARGIN;
      ctx.fillRect(x + itemMargin, y + itemMargin, this.config.slotSize - itemMargin * 2, this.config.slotSize - itemMargin * 2);

      // Render item border
      ctx.strokeStyle = GAME_CONSTANTS.UI.INVENTORY.SLOT.ITEM_BORDER_COLOR;
      ctx.lineWidth = GAME_CONSTANTS.UI.INVENTORY.SLOT.ITEM_BORDER_WIDTH;
      ctx.strokeRect(x + itemMargin, y + itemMargin, this.config.slotSize - itemMargin * 2, this.config.slotSize - itemMargin * 2);

      // Render quantity if stackable and > 1
      if (slot.item.stackable && slot.quantity > 1) {
        ctx.fillStyle = GAME_CONSTANTS.UI.INVENTORY.SLOT.QUANTITY_COLOR;
        ctx.font = GAME_CONSTANTS.UI.INVENTORY.SLOT.QUANTITY_FONT;
        ctx.textAlign = 'right';
        ctx.fillText(
          slot.quantity.toString(),
          x + this.config.slotSize - GAME_CONSTANTS.UI.INVENTORY.SLOT.QUANTITY_OFFSET,
          y + this.config.slotSize - GAME_CONSTANTS.UI.INVENTORY.SLOT.QUANTITY_OFFSET
        );
      }

      // Render durability bar for equipment
      if ((slot.item.type === 'weapon' || slot.item.type === 'armor') && 'durability' in slot.item) {
        const durabilityPercent = slot.item.durability / slot.item.maxDurability;
        const barWidth = this.config.slotSize - itemMargin * 2;
        const barHeight = GAME_CONSTANTS.UI.INVENTORY.SLOT.DURABILITY.BAR_HEIGHT;
        
        // Background
        ctx.fillStyle = GAME_CONSTANTS.UI.INVENTORY.SLOT.DURABILITY.BACKGROUND_COLOR;
        ctx.fillRect(x + itemMargin, y + this.config.slotSize - GAME_CONSTANTS.UI.INVENTORY.SLOT.DURABILITY.BAR_OFFSET, barWidth, barHeight);
        
        // Durability bar
        const durabilityColor = durabilityPercent > GAME_CONSTANTS.UI.INVENTORY.SLOT.DURABILITY.HIGH_THRESHOLD 
          ? GAME_CONSTANTS.UI.INVENTORY.SLOT.DURABILITY.HIGH_COLOR
          : durabilityPercent > GAME_CONSTANTS.UI.INVENTORY.SLOT.DURABILITY.MEDIUM_THRESHOLD 
            ? GAME_CONSTANTS.UI.INVENTORY.SLOT.DURABILITY.MEDIUM_COLOR
            : GAME_CONSTANTS.UI.INVENTORY.SLOT.DURABILITY.LOW_COLOR;
        ctx.fillStyle = durabilityColor;
        ctx.fillRect(x + itemMargin, y + this.config.slotSize - GAME_CONSTANTS.UI.INVENTORY.SLOT.DURABILITY.BAR_OFFSET, barWidth * durabilityPercent, barHeight);
      }
    }
  }

  private getItemColor(item: Item): string {
    // Base color by type
    switch (item.type) {
      case 'weapon':
        return GAME_CONSTANTS.UI.ITEM_TYPE_COLORS.WEAPON;
      case 'armor':
        return GAME_CONSTANTS.UI.ITEM_TYPE_COLORS.ARMOR;
      case 'resource':
        return GAME_CONSTANTS.UI.ITEM_TYPE_COLORS.RESOURCE;
      case 'consumable':
        return GAME_CONSTANTS.UI.ITEM_TYPE_COLORS.CONSUMABLE;
      case 'artifact':
        return GAME_CONSTANTS.UI.ITEM_TYPE_COLORS.ARTIFACT;
      default:
        return GAME_CONSTANTS.UI.ITEM_TYPE_COLORS.DEFAULT;
    }
  }

  private getSlotAtPosition(mouseX: number, mouseY: number): number {
    if (!this.isVisible || !this.inventory) return -1;

    const slots = this.inventory.getSlots();
    const rows = Math.ceil(slots.length / this.config.slotsPerRow);
    const panelWidth = this.config.slotsPerRow * (this.config.slotSize + this.config.padding) + this.config.padding;
    const panelHeight = rows * (this.config.slotSize + this.config.padding) + this.config.padding + GAME_CONSTANTS.UI.INVENTORY.PANEL.TITLE_HEIGHT;

    // Use the same positioning as renderFullInventory
    const panelX = GAME_CONSTANTS.CANVAS.WIDTH - panelWidth - 10;
    const panelY = 200;

    for (let i = 0; i < slots.length; i++) {
      const row = Math.floor(i / this.config.slotsPerRow);
      const col = i % this.config.slotsPerRow;
      
      const x = panelX + this.config.padding + col * (this.config.slotSize + this.config.padding);
      const y = panelY + GAME_CONSTANTS.UI.INVENTORY.PANEL.TITLE_HEIGHT + this.config.padding + row * (this.config.slotSize + this.config.padding);
      
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

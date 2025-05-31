import type { Item, InventorySlot, Equipment } from '../../interfaces/gameInterfaces';
import type { Inventory } from '../../game/systems/Inventory';
import { GAME_CONSTANTS } from '../../constants/gameConstants';

export interface InventoryUIConfig {
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
    // Canvas positioning
    private mousePosition: { x: number, y: number } = { x: 0, y: 0 };
    private readonly hotbarConfig = {
        x: 0, // Will be centered horizontally
        y: 0, // Will be at the bottom
        width: 0, // Calculated based on slots
        height: 0, // Calculated based on slot size
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderColor: '#555',
        titleColor: '#00FF00',
        titleFont: '14px Arial',
        slotBackgroundColor: '#2D2D2D',
        slotBorderColor: '#555',
        selectedSlotBorderColor: '#FFFF00',
        slotSize: 32,
        padding: 8,
        gap: 4
    };

    private readonly inventoryConfig = {
        x: 0, // Will be centered
        y: 0, // Will be centered
        width: 0, // Calculated based on slots per row
        height: 0, // Calculated based on rows
        backgroundColor: 'rgba(45, 45, 45, 0.95)',
        borderColor: '#555',
        titleColor: '#00FF00',
        titleFont: '14px Arial',
        padding: 10,
        contentPadding: 40, // Space for title and padding between elements
        equipmentWidth: 160, // Width of equipment panel
        equipmentGap: 20 // Gap between inventory and equipment panels
    };

    public constructor(config: InventoryUIConfig) {
        this.config = config;
        this.inventory = null;
        this.isVisible = false;
        this.selectedSlot = -1;
        this.hotbarSlots = GAME_CONSTANTS.INVENTORY.HOTBAR_SLOTS;
        
        // Calculate dimensions
        this.hotbarConfig.width = (this.hotbarConfig.slotSize * this.hotbarSlots) + 
            (this.hotbarConfig.gap * (this.hotbarSlots - 1)) + (this.hotbarConfig.padding * 2);
        this.hotbarConfig.height = this.hotbarConfig.slotSize + (this.hotbarConfig.padding * 2);

        // Calculate inventory width and height
        const inventoryWidth = (this.config.slotSize * this.config.slotsPerRow) +
            ((this.config.padding * 2) + (this.config.padding * (this.config.slotsPerRow - 1)));
        
        // Total width including equipment panel
        this.inventoryConfig.width = inventoryWidth + this.inventoryConfig.equipmentGap + this.inventoryConfig.equipmentWidth;
        
        // Height will be calculated when inventory is set, but initialize to a reasonable value
        this.inventoryConfig.height = 400; // Will be adjusted when inventory is set
    }

    public setInventory(inventory: Inventory): void {
        this.inventory = inventory;
    }

    public setMousePosition(x: number, y: number): void {
        this.mousePosition = { x, y };
    }

    public setVisible(visible: boolean): void {
        this.isVisible = visible;
    }

    public toggle(): void {
        this.setVisible(!this.isVisible);
    }

    public handleClick(x: number, y: number): boolean {
        if (!this.inventory) return false;

        // Check hotbar slots
        const hotbarSlot = this.getClickedHotbarSlot(x, y);
        if (hotbarSlot !== -1) {
            this.selectedSlot = hotbarSlot;
            return true;
        }

        // Check inventory slots if visible
        if (this.isVisible) {
            const inventorySlot = this.getClickedInventorySlot(x, y);
            if (inventorySlot !== -1) {
                this.selectedSlot = inventorySlot;
                
                // Try to equip item if it's equipment
                const slot = this.inventory.getSlots()[inventorySlot];
                if (slot.item && (slot.item.type === 'weapon' || slot.item.type === 'armor')) {
                    this.inventory.equipItem(inventorySlot);
                }
                return true;
            }
        }

        return false;
    }

    private getClickedHotbarSlot(x: number, y: number): number {
        if (y < this.hotbarConfig.y || y > this.hotbarConfig.y + this.hotbarConfig.height) {
            return -1;
        }

        const slotX = x - this.hotbarConfig.x - this.hotbarConfig.padding;
        const slotIndex = Math.floor(slotX / (this.hotbarConfig.slotSize + this.hotbarConfig.gap));
        
        if (slotIndex >= 0 && slotIndex < this.hotbarSlots) {
            return slotIndex;
        }

        return -1;
    }

    private getClickedInventorySlot(x: number, y: number): number {
        if (!this.isVisible) return -1;

        const relativeX = x - this.inventoryConfig.x - this.inventoryConfig.padding;
        const relativeY = y - this.inventoryConfig.y - this.inventoryConfig.padding;

        const col = Math.floor(relativeX / (this.config.slotSize + this.config.padding));
        const row = Math.floor(relativeY / (this.config.slotSize + this.config.padding));

        if (col >= 0 && col < this.config.slotsPerRow) {
            const slotIndex = row * this.config.slotsPerRow + col;
            if (slotIndex >= 0 && this.inventory && slotIndex < this.inventory.getSlots().length) {
                return slotIndex;
            }
        }

        return -1;
    }

    public render(ctx: CanvasRenderingContext2D): void {
        if (!this.inventory) return;

        this.updatePositions(ctx);
        this.renderHotbar(ctx);
        
        if (this.isVisible) {
            // Semi-transparent background overlay
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            
            this.renderInventory(ctx);
            this.renderEquipment(ctx);
        }
    }

    private updatePositions(ctx: CanvasRenderingContext2D): void {
        // Center hotbar at the bottom of the screen with some padding
        this.hotbarConfig.x = (ctx.canvas.width - this.hotbarConfig.width) / 2;
        this.hotbarConfig.y = ctx.canvas.height - this.hotbarConfig.height - 20;

        if (this.isVisible) {
            // Calculate total width of both panels
            const totalWidth = this.inventoryConfig.width;
            const totalHeight = this.inventoryConfig.height;
            
            // Center the entire UI in the middle of the screen
            const centerX = (ctx.canvas.width - totalWidth) / 2;
            const centerY = (ctx.canvas.height - totalHeight) / 2;
            
            this.inventoryConfig.x = centerX;
            this.inventoryConfig.y = centerY;
        }
    }

    private renderHotbar(ctx: CanvasRenderingContext2D): void {
        if (!this.inventory) return;

        ctx.save();

        // Background
        ctx.fillStyle = this.hotbarConfig.backgroundColor;
        ctx.strokeStyle = this.hotbarConfig.borderColor;
        ctx.lineWidth = 2;
        this.roundRect(ctx, this.hotbarConfig.x, this.hotbarConfig.y, this.hotbarConfig.width, this.hotbarConfig.height, 6);
        ctx.stroke();

        const slots = this.inventory.getSlots();
        const startX = this.hotbarConfig.x + this.hotbarConfig.padding;
        const startY = this.hotbarConfig.y + this.hotbarConfig.padding;

        // Render slots
        for (let i = 0; i < this.hotbarSlots; i++) {
            const x = startX + i * (this.hotbarConfig.slotSize + this.hotbarConfig.gap);
            const y = startY;
            this.renderSlot(ctx, slots[i], i, x, y, i === this.selectedSlot);
            
            // Render slot number
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText((i + 1).toString(), x + this.hotbarConfig.slotSize / 2, y - 5);
        }

        ctx.restore();
    }

    private renderInventory(ctx: CanvasRenderingContext2D): void {
        if (!this.inventory) return;

        ctx.save();

        // Calculate inventory panel width (without equipment panel)
        const inventoryPanelWidth = this.inventoryConfig.width - this.inventoryConfig.equipmentWidth - this.inventoryConfig.equipmentGap;

        // Background
        ctx.fillStyle = this.inventoryConfig.backgroundColor;
        ctx.strokeStyle = this.inventoryConfig.borderColor;
        ctx.lineWidth = 2;
        this.roundRect(ctx, this.inventoryConfig.x, this.inventoryConfig.y, 
            inventoryPanelWidth, this.inventoryConfig.height, 6);
        ctx.stroke();

        // Title
        ctx.fillStyle = this.inventoryConfig.titleColor;
        ctx.font = this.inventoryConfig.titleFont;
        ctx.textAlign = 'center';
        ctx.fillText('Inventory', 
            this.inventoryConfig.x + inventoryPanelWidth / 2, 
            this.inventoryConfig.y + 25);

        const slots = this.inventory.getSlots();
        const startX = this.inventoryConfig.x + this.inventoryConfig.padding;
        const startY = this.inventoryConfig.y + this.inventoryConfig.contentPadding; // Below title

        // Render all slots
        for (let i = 0; i < slots.length; i++) {
            const col = i % this.config.slotsPerRow;
            const row = Math.floor(i / this.config.slotsPerRow);
            const x = startX + col * (this.config.slotSize + this.config.padding);
            const y = startY + row * (this.config.slotSize + this.config.padding);

            this.renderSlot(ctx, slots[i], i, x, y, i === this.selectedSlot);
        }

        ctx.restore();
    }

    private renderEquipment(ctx: CanvasRenderingContext2D): void {
        if (!this.inventory) return;

        const equipment = this.inventory.getEquipment();
        const equipmentPanel = {
            width: this.inventoryConfig.equipmentWidth,
            height: this.inventoryConfig.height,
            x: this.inventoryConfig.x + this.inventoryConfig.width - this.inventoryConfig.equipmentWidth,
            y: this.inventoryConfig.y
        };

        // Equipment panel background
        ctx.fillStyle = this.inventoryConfig.backgroundColor;
        ctx.strokeStyle = this.inventoryConfig.borderColor;
        ctx.lineWidth = 2;
        this.roundRect(ctx, equipmentPanel.x, equipmentPanel.y, equipmentPanel.width, equipmentPanel.height, 6);
        ctx.stroke();

        // Title
        ctx.fillStyle = this.inventoryConfig.titleColor;
        ctx.font = this.inventoryConfig.titleFont;
        ctx.textAlign = 'center';
        ctx.fillText('Equipment', 
            equipmentPanel.x + equipmentPanel.width / 2, 
            equipmentPanel.y + 25);

        const slotSize = this.config.slotSize;
        const padding = this.config.padding;
        const startY = equipmentPanel.y + 40; // Below title
        
        const equipmentSlots = [
            { key: 'helmet' as keyof Equipment, label: 'Helmet', position: 1 },
            { key: 'chestplate' as keyof Equipment, label: 'Chest', position: 4 },
            { key: 'leggings' as keyof Equipment, label: 'Legs', position: 7 },
            { key: 'boots' as keyof Equipment, label: 'Boots', position: 10 },
            { key: 'weapon' as keyof Equipment, label: 'Weapon', position: 3 },
            { key: 'shield' as keyof Equipment, label: 'Shield', position: 5 }
        ];

        // Create 12 slots (3x4 grid)
        for (let i = 0; i < 12; i++) {
            const col = i % 3;
            const row = Math.floor(i / 3);
            const x = equipmentPanel.x + padding + col * (slotSize + padding);
            const y = startY + row * (slotSize + padding);

            // Find equipment in this position
            const equipSlot = equipmentSlots.find(slot => slot.position === i);
            if (equipSlot) {
                const item = equipment[equipSlot.key];
                this.renderSlot(ctx, { item: item || null, quantity: item ? 1 : 0 }, -1, x, y, false);
                
                // Add slot label
                ctx.fillStyle = '#888';
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(equipSlot.label, x + slotSize / 2, y + slotSize + 12);
            } else {
                // Empty decorative slot
                ctx.fillStyle = this.hotbarConfig.slotBackgroundColor;
                ctx.strokeStyle = this.hotbarConfig.slotBorderColor;
                ctx.lineWidth = 2;
                this.roundRect(ctx, x, y, slotSize, slotSize, 3);
                ctx.stroke();
            }
        }
    }

    private renderSlot(ctx: CanvasRenderingContext2D, slot: InventorySlot, index: number, x: number, y: number, selected: boolean): void {
        // Slot background
        ctx.fillStyle = this.hotbarConfig.slotBackgroundColor;
        ctx.strokeStyle = selected ? this.hotbarConfig.selectedSlotBorderColor : this.hotbarConfig.slotBorderColor;
        ctx.lineWidth = 2;
        
        const size = this.hotbarConfig.slotSize;
        this.roundRect(ctx, x, y, size, size, 3);
        ctx.stroke();

        if (slot.item) {
            // Item visual
            ctx.fillStyle = this.getItemColor(slot.item);
            this.roundRect(ctx, x + 4, y + 4, size - 8, size - 8, 2);

            // Quantity for stackable items
            if (slot.item.stackable && slot.quantity > 1) {
                ctx.fillStyle = '#fff';
                ctx.font = '10px Arial';
                ctx.textAlign = 'right';
                ctx.fillText(slot.quantity.toString(), x + size - 4, y + size - 4);
            }

            // Durability bar for equipment
            if ((slot.item.type === 'weapon' || slot.item.type === 'armor') && 'durability' in slot.item) {
                const durabilityPercent = slot.item.durability / slot.item.maxDurability;
                const barWidth = size - 8;
                const barHeight = 2;
                const barX = x + 4;
                const barY = y + size - 6;

                // Background
                ctx.fillStyle = '#333';
                ctx.fillRect(barX, barY, barWidth, barHeight);

                // Fill
                ctx.fillStyle = this.getDurabilityColor(durabilityPercent);
                ctx.fillRect(barX, barY, barWidth * durabilityPercent, barHeight);
            }
        }
    }

    private getItemColor(item: Item): string {
        // Rarity colors
        const rarityColors = {
            common: '#FFFFFF',
            uncommon: '#00FF00',
            rare: '#0080FF',
            epic: '#8000FF',
            legendary: '#FF8000'
        };

        // Type colors for additional visual distinction
        const typeColors = {
            weapon: '#FF6B35',
            armor: '#4169E1',
            resource: '#8B4513',
            consumable: '#32CD32',
            artifact: '#FFD700'
        };

        return rarityColors[item.rarity] || typeColors[item.type] || '#FFFFFF';
    }

    private getDurabilityColor(percentage: number): string {
        if (percentage > 0.66) return '#00FF00';
        if (percentage > 0.33) return '#FFFF00';
        return '#FF0000';
    }

    private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + width, y, x + width, y + height, radius);
        ctx.arcTo(x + width, y + height, x, y + height, radius);
        ctx.arcTo(x, y + height, x, y, radius);
        ctx.arcTo(x, y, x + width, y, radius);
        ctx.closePath();
        ctx.fill();
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

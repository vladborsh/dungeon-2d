import type { GameObject, Position, Size, Item } from '../../interfaces/gameInterfaces';
import { GAME_CONSTANTS } from '../../constants/gameConstants';

export class ItemDrop implements GameObject {
  public readonly position: Position;
  public readonly size: Size;
  private readonly item: Item;
  private readonly quantity: number;
  private readonly createdTime: number;
  private readonly lifetime: number;
  private bobOffset: number;
  private bobDirection: number;

  public constructor(position: Position, item: Item, quantity: number = 1) {
    this.position = position;
    this.size = { width: 16, height: 16 };
    this.item = item;
    this.quantity = quantity;
    this.createdTime = Date.now();
    this.lifetime = 30000; // 30 seconds
    this.bobOffset = 0;
    this.bobDirection = 1;
  }

  public getItem(): Item {
    return this.item;
  }

  public getQuantity(): number {
    return this.quantity;
  }

  public isExpired(): boolean {
    return Date.now() - this.createdTime > this.lifetime;
  }

  public canCollect(playerPosition: Position, playerSize: Size): boolean {
    const distance = Math.sqrt(
      Math.pow(this.position.x - playerPosition.x, 2) +
      Math.pow(this.position.y - playerPosition.y, 2)
    );
    return distance < 24; // Collection radius
  }

  public update(): void {
    // Create a bobbing animation
    this.bobOffset += this.bobDirection * 0.1;
    if (Math.abs(this.bobOffset) > 2) {
      this.bobDirection *= -1;
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    const renderY = this.position.y + this.bobOffset;
    
    // Draw item background glow based on rarity
    const glowColor = this.getRarityColor();
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 8;
    
    // Draw item representation
    ctx.fillStyle = this.getItemColor();
    ctx.fillRect(
      this.position.x + 2,
      renderY + 2,
      this.size.width - 4,
      this.size.height - 4
    );

    // Draw item border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(
      this.position.x + 2,
      renderY + 2,
      this.size.width - 4,
      this.size.height - 4
    );

    // Reset shadow
    ctx.shadowBlur = 0;

    // Draw quantity if > 1
    if (this.quantity > 1) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '8px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        this.quantity.toString(),
        this.position.x + this.size.width / 2,
        renderY + this.size.height - 2
      );
    }

    // Draw pickup hint when close to expiration
    const timeLeft = this.lifetime - (Date.now() - this.createdTime);
    if (timeLeft < 5000) { // Last 5 seconds
      const alpha = Math.sin(Date.now() * 0.01) * 0.5 + 0.5; // Pulsing effect
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        'Press E',
        this.position.x + this.size.width / 2,
        renderY - 5
      );
    }
  }

  private getItemColor(): string {
    switch (this.item.type) {
      case 'weapon':
        return '#8B4513'; // Brown
      case 'armor':
        return '#696969'; // Gray
      case 'resource':
        return '#228B22'; // Green
      case 'consumable':
        return '#4169E1'; // Blue
      case 'artifact':
        return '#FFD700'; // Gold
      default:
        return '#FFFFFF';
    }
  }

  private getRarityColor(): string {
    switch (this.item.rarity) {
      case 'common':
        return GAME_CONSTANTS.ITEMS.COLORS.COMMON;
      case 'uncommon':
        return GAME_CONSTANTS.ITEMS.COLORS.UNCOMMON;
      case 'rare':
        return GAME_CONSTANTS.ITEMS.COLORS.RARE;
      case 'epic':
        return GAME_CONSTANTS.ITEMS.COLORS.EPIC;
      case 'legendary':
        return GAME_CONSTANTS.ITEMS.COLORS.LEGENDARY;
      default:
        return '#FFFFFF';
    }
  }
}

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
    this.size = { 
      width: GAME_CONSTANTS.ITEMS.DROP.SIZE.WIDTH, 
      height: GAME_CONSTANTS.ITEMS.DROP.SIZE.HEIGHT 
    };
    this.item = item;
    this.quantity = quantity;
    this.createdTime = Date.now();
    this.lifetime = GAME_CONSTANTS.ITEMS.DROP.LIFETIME;
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
    return false; // Items never expire
  }

  public canCollect(playerPosition: Position, playerSize: Size): boolean {
    const distance = Math.sqrt(
      Math.pow(this.position.x - playerPosition.x, 2) +
      Math.pow(this.position.y - playerPosition.y, 2)
    );
    return distance < GAME_CONSTANTS.ITEMS.DROP.COLLECTION_RADIUS;
  }

  public update(): void {
    // Create a bobbing animation
    this.bobOffset += this.bobDirection * GAME_CONSTANTS.ITEMS.DROP.ANIMATION.BOB_SPEED;
    if (Math.abs(this.bobOffset) > GAME_CONSTANTS.ITEMS.DROP.ANIMATION.BOB_OFFSET_LIMIT) {
      this.bobDirection *= -1;
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    const renderY = this.position.y + this.bobOffset;
    const dropConstants = GAME_CONSTANTS.ITEMS.DROP;
    
    // Draw item background glow based on rarity
    const glowColor = this.getRarityColor();
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = dropConstants.VISUAL.SHADOW_BLUR;
    
    // Draw item representation
    ctx.fillStyle = this.getItemColor();
    ctx.fillRect(
      this.position.x + dropConstants.VISUAL.PADDING,
      renderY + dropConstants.VISUAL.PADDING,
      this.size.width - dropConstants.VISUAL.PADDING * 2,
      this.size.height - dropConstants.VISUAL.PADDING * 2
    );

    // Draw item border
    ctx.strokeStyle = dropConstants.VISUAL.BORDER_COLOR;
    ctx.lineWidth = dropConstants.VISUAL.BORDER_WIDTH;
    ctx.strokeRect(
      this.position.x + dropConstants.VISUAL.PADDING,
      renderY + dropConstants.VISUAL.PADDING,
      this.size.width - dropConstants.VISUAL.PADDING * 2,
      this.size.height - dropConstants.VISUAL.PADDING * 2
    );

    // Reset shadow
    ctx.shadowBlur = 0;

    // Draw quantity if > 1
    if (this.quantity > 1) {
      ctx.fillStyle = dropConstants.TEXT.QUANTITY_COLOR;
      ctx.font = dropConstants.TEXT.QUANTITY_FONT;
      ctx.textAlign = 'center';
      ctx.fillText(
        this.quantity.toString(),
        this.position.x + this.size.width / 2,
        renderY + this.size.height - dropConstants.TEXT.QUANTITY_OFFSET
      );
    }
  }

  private getItemColor(): string {
    switch (this.item.type) {
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

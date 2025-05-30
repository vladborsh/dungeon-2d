import type { Player } from '../../game/entities/Player';
import { GAME_CONSTANTS } from '../../constants/gameConstants';

export interface PlayerInfoUIConfig {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export class PlayerInfoUI {
  private readonly config: PlayerInfoUIConfig;
  private player: Player | null;

  public constructor(config: PlayerInfoUIConfig) {
    this.config = config;
    this.player = null;
  }

  public setPlayer(player: Player): void {
    this.player = player;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.player) return;

    ctx.save();
    
    const stats = this.player.getStats();
    const equipment = this.player.getInventory().getEquipment();
    
    // Set up stats display style
    ctx.font = GAME_CONSTANTS.UI.PLAYER_INFO.TEXT_FONT;
    ctx.textBaseline = 'top';
    
    // Render stats background
    ctx.fillStyle = GAME_CONSTANTS.UI.PLAYER_INFO.BACKGROUND_COLOR;
    ctx.fillRect(this.config.x, this.config.y, this.config.width, this.config.height);
    
    ctx.strokeStyle = GAME_CONSTANTS.UI.PLAYER_INFO.BORDER_COLOR;
    ctx.lineWidth = GAME_CONSTANTS.UI.PLAYER_INFO.BORDER_WIDTH;
    ctx.strokeRect(this.config.x, this.config.y, this.config.width, this.config.height);
    
    // Render title
    ctx.fillStyle = GAME_CONSTANTS.UI.PLAYER_INFO.TITLE_COLOR;
    ctx.font = GAME_CONSTANTS.UI.PLAYER_INFO.TITLE_FONT;
    ctx.textAlign = 'center';
    ctx.fillText(
      'Player Stats',
      this.config.x + this.config.width / 2,
      this.config.y + GAME_CONSTANTS.UI.PLAYER_INFO.TITLE_OFFSET
    );
    
    // Render stats text
    ctx.font = GAME_CONSTANTS.UI.PLAYER_INFO.TEXT_FONT;
    ctx.fillStyle = GAME_CONSTANTS.UI.PLAYER_INFO.TEXT_COLOR;
    ctx.textAlign = 'left';
    
    let yOffset = this.config.y + GAME_CONSTANTS.UI.PLAYER_INFO.CONTENT_START_Y;
    const lineHeight = GAME_CONSTANTS.UI.PLAYER_INFO.LINE_HEIGHT;
    const padding = GAME_CONSTANTS.UI.PLAYER_INFO.PADDING;
    
    ctx.fillText(`Level: ${stats.level}`, this.config.x + padding, yOffset);
    yOffset += lineHeight;
    
    ctx.fillText(`HP: ${stats.health}/${stats.maxHealth}`, this.config.x + padding, yOffset);
    yOffset += lineHeight;
    
    ctx.fillText(`MP: ${stats.mana}/${stats.maxMana}`, this.config.x + padding, yOffset);
    yOffset += lineHeight;
    
    ctx.fillText(`ATK: ${stats.attack}`, this.config.x + padding, yOffset);
    yOffset += lineHeight;
    
    ctx.fillText(`DEF: ${stats.defense}`, this.config.x + padding, yOffset);
    yOffset += lineHeight;
    
    ctx.fillText(`SPD: ${stats.speed}`, this.config.x + padding, yOffset);
    yOffset += lineHeight;
    
    ctx.fillText(`EXP: ${stats.experience}/${stats.experienceToNext}`, this.config.x + padding, yOffset);
    yOffset += lineHeight + 5;
    
    // Render health bar
    const barWidth = this.config.width - padding * 2;
    const barHeight = GAME_CONSTANTS.UI.PLAYER_INFO.BAR_HEIGHT;
    const healthBarX = this.config.x + padding;
    const healthBarY = yOffset;
    
    // Health bar background
    ctx.fillStyle = GAME_CONSTANTS.UI.PLAYER_INFO.BAR_BACKGROUND_COLOR;
    ctx.fillRect(healthBarX, healthBarY, barWidth, barHeight);
    
    // Health bar fill
    const healthPercent = stats.health / stats.maxHealth;
    ctx.fillStyle = healthPercent > 0.5 ? 
      GAME_CONSTANTS.UI.PLAYER_INFO.HEALTH_HIGH_COLOR : 
      healthPercent > 0.25 ? 
        GAME_CONSTANTS.UI.PLAYER_INFO.HEALTH_MEDIUM_COLOR : 
        GAME_CONSTANTS.UI.PLAYER_INFO.HEALTH_LOW_COLOR;
    ctx.fillRect(healthBarX, healthBarY, barWidth * healthPercent, barHeight);
    
    // Health bar border
    ctx.strokeStyle = GAME_CONSTANTS.UI.PLAYER_INFO.BAR_BORDER_COLOR;
    ctx.lineWidth = 1;
    ctx.strokeRect(healthBarX, healthBarY, barWidth, barHeight);
    
    yOffset += barHeight + 5;
    
    // Mana bar
    const manaBarY = yOffset;
    
    // Mana bar background
    ctx.fillStyle = GAME_CONSTANTS.UI.PLAYER_INFO.BAR_BACKGROUND_COLOR;
    ctx.fillRect(healthBarX, manaBarY, barWidth, barHeight);
    
    // Mana bar fill
    const manaPercent = stats.mana / stats.maxMana;
    ctx.fillStyle = GAME_CONSTANTS.UI.PLAYER_INFO.MANA_COLOR;
    ctx.fillRect(healthBarX, manaBarY, barWidth * manaPercent, barHeight);
    
    // Mana bar border
    ctx.strokeStyle = GAME_CONSTANTS.UI.PLAYER_INFO.BAR_BORDER_COLOR;
    ctx.lineWidth = 1;
    ctx.strokeRect(healthBarX, manaBarY, barWidth, barHeight);
    
    ctx.restore();
  }
}

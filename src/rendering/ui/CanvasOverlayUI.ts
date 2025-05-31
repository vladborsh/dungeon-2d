import type { Player } from '../../game/entities/Player';
import { GAME_CONSTANTS } from '../../constants/gameConstants';

export interface CanvasOverlayUIConfig {
    readonly padding: number;
    readonly width: number;
    readonly height: number;
}

export class CanvasOverlayUI {
    private readonly config: CanvasOverlayUIConfig;
    private player: Player | null;
    private readonly stats = GAME_CONSTANTS.UI.OVERLAY_UI.STATS;

    public constructor(config: CanvasOverlayUIConfig) {
        this.config = config;
        this.player = null;
    }

    public setPlayer(player: Player): void {
        this.player = player;
    }

    public render(ctx: CanvasRenderingContext2D): void {
        if (!this.player) return;

        const stats = this.player.getStats();
        
        // Position in top right corner
        const x = ctx.canvas.width - this.stats.WIDTH - this.stats.PADDING;
        const y = this.stats.PADDING;
        
        // Background panel
        ctx.fillStyle = this.stats.BACKGROUND_COLOR;
        ctx.strokeStyle = this.stats.BORDER_COLOR;
        ctx.lineWidth = this.stats.BORDER_WIDTH;
        ctx.fillRect(x, y, this.stats.WIDTH, this.stats.HEIGHT);
        ctx.strokeRect(x, y, this.stats.WIDTH, this.stats.HEIGHT);

        // Title
        ctx.fillStyle = this.stats.TITLE_COLOR;
        ctx.font = this.stats.TITLE_FONT;
        ctx.textAlign = 'center';
        ctx.fillText(this.stats.TITLE, x + this.stats.WIDTH / 2, y + this.stats.TITLE_OFFSET);

        // Stats text
        ctx.fillStyle = this.stats.TEXT_COLOR;
        ctx.font = this.stats.TEXT_FONT;
        ctx.textAlign = 'left';
        let textY = y + this.stats.FIRST_STAT_OFFSET;

        const renderStat = (label: string, value: number | string) => {
            ctx.fillText(`${label}: ${value}`, x + this.stats.PADDING, textY);
            textY += this.stats.LINE_HEIGHT;
        };

        renderStat('Level', stats.level);
        renderStat('HP', `${stats.health}/${stats.maxHealth}`);
        renderStat('MP', `${stats.mana}/${stats.maxMana}`);
        renderStat('ATK', stats.attack);
        renderStat('DEF', stats.defense);
        renderStat('SPD', stats.speed);
        renderStat('EXP', `${stats.experience}/${stats.experienceToNext}`);

        // Health bar
        this.renderBar(ctx, x + this.stats.PADDING, textY, 
            this.stats.WIDTH - 2 * this.stats.PADDING, this.stats.BAR_HEIGHT, 
            stats.health / stats.maxHealth, this.stats.HEALTH_COLOR);
        textY += this.stats.BAR_SPACING;

        // Mana bar
        this.renderBar(ctx, x + this.stats.PADDING, textY, 
            this.stats.WIDTH - 2 * this.stats.PADDING, this.stats.BAR_HEIGHT, 
            stats.mana / stats.maxMana, this.stats.MANA_COLOR);
    }

    private renderBar(
        ctx: CanvasRenderingContext2D, 
        x: number, 
        y: number, 
        width: number, 
        height: number, 
        percentage: number,
        color: string
    ): void {
        // Bar background
        ctx.fillStyle = this.stats.BAR_BACKGROUND_COLOR;
        ctx.fillRect(x, y, width, height);

        // Bar fill
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width * Math.max(0, Math.min(1, percentage)), height);

        // Bar border
        ctx.strokeStyle = this.stats.BAR_BORDER_COLOR;
        ctx.lineWidth = this.stats.BAR_BORDER_WIDTH;
        ctx.strokeRect(x, y, width, height);
    }
}
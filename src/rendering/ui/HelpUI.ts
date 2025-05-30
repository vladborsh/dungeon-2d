import { GAME_CONSTANTS } from '../../constants/gameConstants';

export interface HelpUIConfig {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export class HelpUI {
  private readonly config: HelpUIConfig;
  private isVisible: boolean;

  public constructor(config: HelpUIConfig) {
    this.config = config;
    this.isVisible = false;
  }

  public setVisible(visible: boolean): void {
    this.isVisible = visible;
  }

  public toggle(): void {
    this.isVisible = !this.isVisible;
  }

  public getIsVisible(): boolean {
    return this.isVisible;
  }

  public handleClick(mouseX: number, mouseY: number): boolean {
    if (!this.isVisible) return false;
    
    // Check if click is outside the help window to close it
    if (mouseX < this.config.x || mouseX > this.config.x + this.config.width ||
        mouseY < this.config.y || mouseY > this.config.y + this.config.height) {
      this.setVisible(false);
      return true;
    }
    
    return true; // Consume click if it's inside the window
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.isVisible) return;

    ctx.save();

    // Render background overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Render help window
    ctx.fillStyle = GAME_CONSTANTS.UI.HELP.BACKGROUND_COLOR;
    ctx.fillRect(this.config.x, this.config.y, this.config.width, this.config.height);

    // Render border
    ctx.strokeStyle = GAME_CONSTANTS.UI.HELP.BORDER_COLOR;
    ctx.lineWidth = GAME_CONSTANTS.UI.HELP.BORDER_WIDTH;
    ctx.strokeRect(this.config.x, this.config.y, this.config.width, this.config.height);

    // Render title
    ctx.fillStyle = GAME_CONSTANTS.UI.HELP.TITLE_COLOR;
    ctx.font = GAME_CONSTANTS.UI.HELP.TITLE_FONT;
    ctx.textAlign = 'center';
    ctx.fillText(
      '🎮 Game Controls', 
      this.config.x + this.config.width / 2, 
      this.config.y + GAME_CONSTANTS.UI.HELP.TITLE_OFFSET
    );

    // Render controls text
    ctx.fillStyle = GAME_CONSTANTS.UI.HELP.TEXT_COLOR;
    ctx.font = GAME_CONSTANTS.UI.HELP.TEXT_FONT;
    ctx.textAlign = 'left';

    const controls = [
      '',
      'Movement:',
      '  WASD or Arrow Keys - Move player',
      '',
      'Inventory:',
      '  I - Toggle inventory panel',
      '  1-9, 0 - Select hotbar slots',
      '  Click items to equip weapons/armor',
      '',
      'Items:',
      '  E - Collect nearby items',
      '  Walk over items to auto-collect',
      '',
      'Interface:',
      '  H - Toggle this help window',
      '  Click outside window to close',
      '',
      'Press H or click outside to close'
    ];

    let yOffset = this.config.y + GAME_CONSTANTS.UI.HELP.CONTENT_START_Y;
    const lineHeight = GAME_CONSTANTS.UI.HELP.LINE_HEIGHT;

    controls.forEach(line => {
      if (line.startsWith('  ')) {
        // Indented controls
        ctx.fillStyle = GAME_CONSTANTS.UI.HELP.CONTROL_COLOR;
        ctx.fillText(line, this.config.x + GAME_CONSTANTS.UI.HELP.INDENT, yOffset);
      } else if (line.endsWith(':')) {
        // Section headers
        ctx.fillStyle = GAME_CONSTANTS.UI.HELP.HEADER_COLOR;
        ctx.fillText(line, this.config.x + GAME_CONSTANTS.UI.HELP.PADDING, yOffset);
      } else if (line.trim()) {
        // Regular text
        ctx.fillStyle = GAME_CONSTANTS.UI.HELP.TEXT_COLOR;
        ctx.fillText(line, this.config.x + GAME_CONSTANTS.UI.HELP.PADDING, yOffset);
      }
      yOffset += lineHeight;
    });

    ctx.restore();
  }

  public renderHintButton(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    const buttonX = GAME_CONSTANTS.UI.HELP.HINT_BUTTON.X;
    const buttonY = GAME_CONSTANTS.UI.HELP.HINT_BUTTON.Y;
    const buttonWidth = GAME_CONSTANTS.UI.HELP.HINT_BUTTON.WIDTH;
    const buttonHeight = GAME_CONSTANTS.UI.HELP.HINT_BUTTON.HEIGHT;

    // Render button background
    ctx.fillStyle = GAME_CONSTANTS.UI.HELP.HINT_BUTTON.BACKGROUND_COLOR;
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

    // Render button border
    ctx.strokeStyle = GAME_CONSTANTS.UI.HELP.HINT_BUTTON.BORDER_COLOR;
    ctx.lineWidth = GAME_CONSTANTS.UI.HELP.HINT_BUTTON.BORDER_WIDTH;
    ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);

    // Render button text
    ctx.fillStyle = GAME_CONSTANTS.UI.HELP.HINT_BUTTON.TEXT_COLOR;
    ctx.font = GAME_CONSTANTS.UI.HELP.HINT_BUTTON.TEXT_FONT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      '?', 
      buttonX + buttonWidth / 2, 
      buttonY + buttonHeight / 2
    );

    ctx.restore();
  }

  public handleHintButtonClick(mouseX: number, mouseY: number): boolean {
    const buttonX = GAME_CONSTANTS.UI.HELP.HINT_BUTTON.X;
    const buttonY = GAME_CONSTANTS.UI.HELP.HINT_BUTTON.Y;
    const buttonWidth = GAME_CONSTANTS.UI.HELP.HINT_BUTTON.WIDTH;
    const buttonHeight = GAME_CONSTANTS.UI.HELP.HINT_BUTTON.HEIGHT;

    if (mouseX >= buttonX && mouseX <= buttonX + buttonWidth &&
        mouseY >= buttonY && mouseY <= buttonY + buttonHeight) {
      this.toggle();
      return true;
    }

    return false;
  }
}

import { GAME_CONSTANTS } from '../../constants/gameConstants';
import { Size } from '../../interfaces/gameInterfaces';
import { Sprite } from './Sprite';

export class WallSprite extends Sprite {
  private readonly wallType: string;
  private readonly variation: number;

  constructor(size: Size, wallType: string, variation: number = 0) {
    super(size);
    this.wallType = wallType;
    this.variation = variation;
    this.createWallSprite();
  }

  private createWallSprite(): void {
    const ctx = this.context;
    const width = this.size.width;
    const height = this.size.height;
    const colors = this.getWallColors();

    // Clear the canvas
    ctx.clearRect(0, 0, width, height);

    // Draw base wall
    ctx.fillStyle = colors.primary;
    ctx.fillRect(0, 0, width, height);

    // Add texture variation based on wall type
    switch (this.wallType) {
      case GAME_CONSTANTS.WALLS.TYPES.CRACKED:
        this.drawCracks(colors);
        break;
      case GAME_CONSTANTS.WALLS.TYPES.MOSSY:
        this.drawMoss(colors);
        break;
      case GAME_CONSTANTS.WALLS.TYPES.REINFORCED:
        this.drawReinforced(colors);
        break;
    }

    // Add some noise and variation
    this.addNoise(0.1);
    
    // Add highlights
    this.addHighlights(colors);
  }

  private getWallColors(): { primary: string; secondary: string; highlight: string } {
    const style = this.variation % 3 === 0 ? 'ANCIENT' :
                 this.variation % 2 === 0 ? 'CAVE' : 'DUNGEON';
    
    return {
      primary: GAME_CONSTANTS.WALLS[style].PRIMARY,
      secondary: GAME_CONSTANTS.WALLS[style].SECONDARY,
      highlight: GAME_CONSTANTS.WALLS[style].HIGHLIGHT
    };
  }

  private drawCracks(colors: { primary: string; secondary: string }): void {
    const ctx = this.context;
    const width = this.size.width;
    const height = this.size.height;

    // Draw random cracks
    ctx.strokeStyle = colors.secondary;
    ctx.lineWidth = 1;

    for (let i = 0; i < 3 + Math.random() * 2; i++) {
      ctx.beginPath();
      const startX = Math.random() * width;
      const startY = Math.random() * height;
      
      ctx.moveTo(startX, startY);
      
      // Create a jagged line for the crack
      let currentX = startX;
      let currentY = startY;
      const steps = 3 + Math.random() * 3;
      
      for (let j = 0; j < steps; j++) {
        currentX += (Math.random() - 0.5) * 8;
        currentY += (Math.random() - 0.5) * 8;
        ctx.lineTo(currentX, currentY);
      }
      
      ctx.stroke();
    }
  }

  private drawMoss(colors: { primary: string; secondary: string }): void {
    const ctx = this.context;
    const width = this.size.width;
    const height = this.size.height;

    // Draw moss patches
    ctx.fillStyle = '#2D4F1E';
    
  }

  private drawReinforced(colors: { primary: string; secondary: string }): void {
    const ctx = this.context;
    const width = this.size.width;
    const height = this.size.height;

    // Draw reinforcement strips
    ctx.fillStyle = colors.secondary;
    
    // Horizontal strips
    ctx.fillRect(0, height * 0.2, width, height * 0.1);
    ctx.fillRect(0, height * 0.7, width, height * 0.1);
    
    // Vertical strips
    ctx.fillRect(width * 0.2, 0, width * 0.1, height);
    ctx.fillRect(width * 0.7, 0, width * 0.1, height);
  }

  private addNoise(intensity: number): void {
    const ctx = this.context;
    const imageData = ctx.getImageData(0, 0, this.size.width, this.size.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * intensity * 255;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }

    ctx.putImageData(imageData, 0, 0);
  }

  private addHighlights(colors: { primary: string; secondary: string; highlight: string }): void {
    const ctx = this.context;
    const width = this.size.width;
    const height = this.size.height;

    // Add subtle highlight on top edge
    const gradient = ctx.createLinearGradient(0, 0, 0, height * 0.3);
    gradient.addColorStop(0, colors.highlight);
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.globalAlpha = 0.2;
    ctx.fillRect(0, 0, width, height * 0.3);
    ctx.globalAlpha = 1;
  }
}

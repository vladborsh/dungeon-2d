import { GAME_CONSTANTS } from '../../constants/gameConstants';
import { Size } from '../../interfaces/gameInterfaces';
import { Sprite } from './Sprite';

export class FloorSprite extends Sprite {
  private readonly floorType: string;
  private readonly variation: number;

  constructor(size: Size, floorType: string, variation: number = 0) {
    super(size);
    this.floorType = floorType;
    this.variation = variation;
    this.createFloorSprite();
  }

  private createFloorSprite(): void {
    const ctx = this.context;
    const width = this.size.width;
    const height = this.size.height;
    const colors = this.getFloorColors();

    // Clear the canvas
    ctx.clearRect(0, 0, width, height);

    // Draw base floor
    ctx.fillStyle = colors.primary;
    ctx.fillRect(0, 0, width, height);

    // Add texture variation based on floor type
    switch (this.floorType) {
      case GAME_CONSTANTS.FLOORS.TYPES.STONE:
        this.drawStoneTexture(colors);
        break;
      case GAME_CONSTANTS.FLOORS.TYPES.MARBLE:
        this.drawMarbleTexture(colors);
        break;
      case GAME_CONSTANTS.FLOORS.TYPES.DIRT:
        this.drawDirtTexture(colors);
        break;
      case GAME_CONSTANTS.FLOORS.TYPES.CRACKED:
        this.drawCrackedTexture(colors);
        break;
      case GAME_CONSTANTS.FLOORS.TYPES.WET:
        this.drawWetTexture(colors);
        break;
    }

    // Add some noise and variation
    this.addNoise(0.05);
  }

  private getFloorColors(): { primary: string; secondary: string; accent: string } {
    const style = this.variation % 3 === 0 ? 'ANCIENT' :
                 this.variation % 2 === 0 ? 'CAVE' : 'DUNGEON';
    
    return {
      primary: GAME_CONSTANTS.FLOORS[style].PRIMARY,
      secondary: GAME_CONSTANTS.FLOORS[style].SECONDARY,
      accent: GAME_CONSTANTS.FLOORS[style].ACCENT
    };
  }

  private drawStoneTexture(colors: { primary: string; secondary: string; accent: string }): void {
    const ctx = this.context;
    const width = this.size.width;
    const height = this.size.height;

    // Draw stone blocks pattern
    ctx.strokeStyle = colors.secondary;
    ctx.lineWidth = 1;

    // Draw horizontal lines
    for (let y = height / 3; y < height; y += height / 3) {
      ctx.beginPath();
      ctx.moveTo(0, y + (Math.random() - 0.5) * 4);
      ctx.lineTo(width, y + (Math.random() - 0.5) * 4);
      ctx.stroke();
    }

    // Draw vertical lines
    for (let x = width / 3; x < width; x += width / 3) {
      ctx.beginPath();
      ctx.moveTo(x + (Math.random() - 0.5) * 4, 0);
      ctx.lineTo(x + (Math.random() - 0.5) * 4, height);
      ctx.stroke();
    }
  }

  private drawMarbleTexture(colors: { primary: string; secondary: string; accent: string }): void {
    const ctx = this.context;
    const width = this.size.width;
    const height = this.size.height;

    // Create marble-like veins
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1;
      
      ctx.beginPath();
      const startX = Math.random() * width;
      const startY = Math.random() * height;
      
      ctx.moveTo(startX, startY);
      
      const points = [];
      for (let j = 0; j < 3; j++) {
        points.push({
          x: startX + (Math.random() - 0.5) * width * 0.8,
          y: startY + (Math.random() - 0.5) * height * 0.8
        });
      }
      
      ctx.bezierCurveTo(
        points[0].x, points[0].y,
        points[1].x, points[1].y,
        points[2].x, points[2].y
      );
      
      ctx.stroke();
    }
  }

  private drawDirtTexture(colors: { primary: string; secondary: string; accent: string }): void {
    const ctx = this.context;
    const width = this.size.width;
    const height = this.size.height;

    // Add random dirt specs
    ctx.fillStyle = colors.accent;
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = 1 + Math.random() * 2;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawCrackedTexture(colors: { primary: string; secondary: string; accent: string }): void {
    const ctx = this.context;
    const width = this.size.width;
    const height = this.size.height;

    // Draw cracks
    ctx.strokeStyle = colors.secondary;
    ctx.lineWidth = 0.5;

    for (let i = 0; i < 2; i++) {
      const startX = Math.random() * width;
      const startY = Math.random() * height;
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      
      let currentX = startX;
      let currentY = startY;
      const steps = 3 + Math.random() * 2;
      
      for (let j = 0; j < steps; j++) {
        currentX += (Math.random() - 0.5) * 6;
        currentY += (Math.random() - 0.5) * 6;
        ctx.lineTo(currentX, currentY);
      }
      
      ctx.stroke();
    }
  }

  private drawWetTexture(colors: { primary: string; secondary: string; accent: string }): void {
    const ctx = this.context;
    const width = this.size.width;
    const height = this.size.height;

    // Add water puddle effect
    for (let i = 0; i < 2; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = 2 + Math.random() * 4;

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, colors.accent);
      gradient.addColorStop(1, colors.primary);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(x, y, radius, radius * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
    }
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
}

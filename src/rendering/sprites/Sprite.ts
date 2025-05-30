import type { Size } from '../../interfaces/gameInterfaces';

export class Sprite {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  public readonly size: Size;

  public constructor(size: Size) {
    this.size = size;
    this.canvas = document.createElement('canvas');
    this.canvas.width = size.width;
    this.canvas.height = size.height;
    
    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get 2D context for sprite');
    }
    this.ctx = context;
    
    // Set default background to transparent
    this.ctx.clearRect(0, 0, size.width, size.height);
  }

  public get context(): CanvasRenderingContext2D {
    return this.ctx;
  }

  public setPixel(x: number, y: number, color: string): void {
    if (x < 0 || x >= this.size.width || y < 0 || y >= this.size.height) {
      return;
    }

    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, 1, 1);
  }

  public render(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.drawImage(this.canvas, x, y);
  }
}
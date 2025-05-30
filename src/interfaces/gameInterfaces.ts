export interface Position {
  x: number;
  y: number;
}

export interface Size {
  readonly width: number;
  readonly height: number;
}

export interface GameObject {
  readonly position: Position;
  readonly size: Size;
  update(): void;
  render(ctx: CanvasRenderingContext2D): void;
}

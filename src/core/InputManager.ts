export interface InputState {
  readonly up: boolean;
  readonly down: boolean;
  readonly left: boolean;
  readonly right: boolean;
}

export class InputManager {
  private readonly keyState: Map<string, boolean>;

  public constructor() {
    this.keyState = new Map();
    this.setupEventListeners();
  }

  public getInputState(): InputState {
    return {
      up: this.isKeyPressed('KeyW'),
      down: this.isKeyPressed('KeyS'),
      left: this.isKeyPressed('KeyA'),
      right: this.isKeyPressed('KeyD')
    };
  }

  private isKeyPressed(code: string): boolean {
    return this.keyState.get(code) || false;
  }

  private setupEventListeners(): void {
    window.addEventListener('keydown', (event: KeyboardEvent) => {
      this.keyState.set(event.code, true);
    });

    window.addEventListener('keyup', (event: KeyboardEvent) => {
      this.keyState.set(event.code, false);
    });
  }
}

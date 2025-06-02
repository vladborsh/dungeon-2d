import type { Position, Size, EnemyStats, EnemyAI } from '../../interfaces/gameInterfaces';
import { EnemyType } from '../../interfaces/gameInterfaces';
import { Enemy } from './Enemy';
import { Sprite } from '../../rendering/sprites/Sprite';
import { GAME_CONSTANTS } from '../../constants/gameConstants';
import type { GameEngine } from '../../core/GameEngine';

export class Goblin extends Enemy {
  public constructor(position: Position, ai: EnemyAI, gameEngine: GameEngine) {
    const stats: EnemyStats = {
      health: GAME_CONSTANTS.ENEMIES.GOBLIN.HEALTH,
      maxHealth: GAME_CONSTANTS.ENEMIES.GOBLIN.HEALTH,
      damage: GAME_CONSTANTS.ENEMIES.GOBLIN.DAMAGE,
      speed: GAME_CONSTANTS.ENEMIES.GOBLIN.SPEED,
      detectionRadius: GAME_CONSTANTS.ENEMIES.GOBLIN.DETECTION_RADIUS,
      attackRange: GAME_CONSTANTS.ENEMIES.GOBLIN.ATTACK_RANGE,
      attackCooldown: GAME_CONSTANTS.ENEMIES.GOBLIN.ATTACK_COOLDOWN,
      experienceReward: GAME_CONSTANTS.ENEMIES.GOBLIN.EXPERIENCE_REWARD,
    };

    super(position, EnemyType.GOBLIN, stats, ai, gameEngine);
  }

  protected getEnemySize(): Size {
    return {
      width: GAME_CONSTANTS.ENEMIES.GOBLIN.SIZE,
      height: GAME_CONSTANTS.ENEMIES.GOBLIN.SIZE,
    };
  }

  protected getEnemyColor(): string {
    return GAME_CONSTANTS.ENEMIES.GOBLIN.COLOR;
  }

  protected createSprite(): Sprite {
    const sprite = new Sprite(this.size);
    const ctx = sprite.context;

    // Simple goblin sprite - green with darker features
    const pixels = [
      '  GGGG  ',
      ' GGGDGG ',
      ' GDDDGD ',
      '  GGGG  ',
      ' BBBBBB ',
      'BBBBBBBB',
      ' B BB B ',
      ' D DD D ',
    ];

    type ColorMap = {
      'G': string;
      'D': string;
      'B': string;
      ' ': string;
    };

    const colors: ColorMap = {
      'G': GAME_CONSTANTS.ENEMIES.GOBLIN.COLOR, // Brown/green
      'D': '#2F4F2F', // Dark green
      'B': '#654321', // Brown for body
      ' ': 'transparent',
    };

    pixels.forEach((row, y) => {
      [...row].forEach((pixel, x) => {
        const p = pixel as keyof ColorMap;
        if (p !== ' ') {
          ctx.fillStyle = colors[p];
          ctx.fillRect(x * 3, y * 3, 3, 3);
        }
      });
    });

    return sprite;
  }
}

export class Skeleton extends Enemy {
  public constructor(position: Position, ai: EnemyAI, gameEngine: GameEngine) {
    const stats: EnemyStats = {
      health: GAME_CONSTANTS.ENEMIES.SKELETON.HEALTH,
      maxHealth: GAME_CONSTANTS.ENEMIES.SKELETON.HEALTH,
      damage: GAME_CONSTANTS.ENEMIES.SKELETON.DAMAGE,
      speed: GAME_CONSTANTS.ENEMIES.SKELETON.SPEED,
      detectionRadius: GAME_CONSTANTS.ENEMIES.SKELETON.DETECTION_RADIUS,
      attackRange: GAME_CONSTANTS.ENEMIES.SKELETON.ATTACK_RANGE,
      attackCooldown: GAME_CONSTANTS.ENEMIES.SKELETON.ATTACK_COOLDOWN,
      experienceReward: GAME_CONSTANTS.ENEMIES.SKELETON.EXPERIENCE_REWARD,
    };

    super(position, EnemyType.SKELETON, stats, ai, gameEngine);
  }

  protected getEnemySize(): Size {
    return {
      width: GAME_CONSTANTS.ENEMIES.SKELETON.SIZE,
      height: GAME_CONSTANTS.ENEMIES.SKELETON.SIZE,
    };
  }

  protected getEnemyColor(): string {
    return GAME_CONSTANTS.ENEMIES.SKELETON.COLOR;
  }

  protected createSprite(): Sprite {
    const sprite = new Sprite(this.size);
    const ctx = sprite.context;

    // Simple skeleton sprite - beige/white bones
    const pixels = [
      '  WWWW  ',
      ' WDDDW ',
      ' WDDDW ',
      '  WWWW  ',
      ' WWWWWW ',
      'WWWWWWWW',
      ' W WW W ',
      ' W WW W ',
    ];

    type ColorMap = {
      'W': string;
      'D': string;
      ' ': string;
    };

    const colors: ColorMap = {
      'W': GAME_CONSTANTS.ENEMIES.SKELETON.COLOR, // Bone white
      'D': '#A0A0A0', // Gray for eye sockets
      ' ': 'transparent',
    };

    pixels.forEach((row, y) => {
      [...row].forEach((pixel, x) => {
        const p = pixel as keyof ColorMap;
        if (p !== ' ') {
          ctx.fillStyle = colors[p];
          ctx.fillRect(x * 3, y * 3, 3, 3);
        }
      });
    });

    return sprite;
  }
}

export class Spider extends Enemy {
  public constructor(position: Position, ai: EnemyAI, gameEngine: GameEngine) {
    const stats: EnemyStats = {
      health: GAME_CONSTANTS.ENEMIES.SPIDER.HEALTH,
      maxHealth: GAME_CONSTANTS.ENEMIES.SPIDER.HEALTH,
      damage: GAME_CONSTANTS.ENEMIES.SPIDER.DAMAGE,
      speed: GAME_CONSTANTS.ENEMIES.SPIDER.SPEED,
      detectionRadius: GAME_CONSTANTS.ENEMIES.SPIDER.DETECTION_RADIUS,
      attackRange: GAME_CONSTANTS.ENEMIES.SPIDER.ATTACK_RANGE,
      attackCooldown: GAME_CONSTANTS.ENEMIES.SPIDER.ATTACK_COOLDOWN,
      experienceReward: GAME_CONSTANTS.ENEMIES.SPIDER.EXPERIENCE_REWARD,
    };

    super(position, EnemyType.SPIDER, stats, ai, gameEngine);
  }

  protected getEnemySize(): Size {
    return {
      width: GAME_CONSTANTS.ENEMIES.SPIDER.SIZE,
      height: GAME_CONSTANTS.ENEMIES.SPIDER.SIZE,
    };
  }

  protected getEnemyColor(): string {
    return GAME_CONSTANTS.ENEMIES.SPIDER.COLOR;
  }

  protected createSprite(): Sprite {
    const sprite = new Sprite(this.size);
    const ctx = sprite.context;

    // Simple spider sprite - purple/black
    const pixels = [
      ' P P P P',
      'PP PPP P',
      ' PPPPPP ',
      ' PPPPP ',
      ' PPPPPP ',
      'PP PPP P',
      ' P P P P',
    ];

    type ColorMap = {
      'P': string;
      ' ': string;
    };

    const colors: ColorMap = {
      'P': GAME_CONSTANTS.ENEMIES.SPIDER.COLOR, // Purple
      ' ': 'transparent',
    };

    pixels.forEach((row, y) => {
      [...row].forEach((pixel, x) => {
        const p = pixel as keyof ColorMap;
        if (p !== ' ') {
          ctx.fillStyle = colors[p];
          ctx.fillRect(x * 3, y * 3, 3, 3);
        }
      });
    });

    return sprite;
  }
}

export class Troll extends Enemy {
  public constructor(position: Position, ai: EnemyAI, gameEngine: GameEngine) {
    const stats: EnemyStats = {
      health: GAME_CONSTANTS.ENEMIES.TROLL.HEALTH,
      maxHealth: GAME_CONSTANTS.ENEMIES.TROLL.HEALTH,
      damage: GAME_CONSTANTS.ENEMIES.TROLL.DAMAGE,
      speed: GAME_CONSTANTS.ENEMIES.TROLL.SPEED,
      detectionRadius: GAME_CONSTANTS.ENEMIES.TROLL.DETECTION_RADIUS,
      attackRange: GAME_CONSTANTS.ENEMIES.TROLL.ATTACK_RANGE,
      attackCooldown: GAME_CONSTANTS.ENEMIES.TROLL.ATTACK_COOLDOWN,
      experienceReward: GAME_CONSTANTS.ENEMIES.TROLL.EXPERIENCE_REWARD,
    };

    super(position, EnemyType.TROLL, stats, ai, gameEngine);
  }

  protected getEnemySize(): Size {
    return {
      width: GAME_CONSTANTS.ENEMIES.TROLL.SIZE,
      height: GAME_CONSTANTS.ENEMIES.TROLL.SIZE,
    };
  }

  protected getEnemyColor(): string {
    return GAME_CONSTANTS.ENEMIES.TROLL.COLOR;
  }

  protected createSprite(): Sprite {
    const sprite = new Sprite(this.size);
    const ctx = sprite.context;

    // Simple troll sprite - larger and green
    const pixels = [
      '    GGGGGG    ',
      '   GGGGGGGG   ',
      '  GGDDGGDDGG  ',
      '   GGGGGGGG   ',
      '    GGGGGG    ',
      '  GGGGGGGGGG  ',
      ' GGGGGGGGGGGG ',
      'GGGGGGGGGGGGGG',
      ' GG GG  GG GG ',
      ' GG GG  GG GG ',
      ' DD DD  DD DD ',
      ' DD DD  DD DD ',
    ];

    type ColorMap = {
      'G': string;
      'D': string;
      ' ': string;
    };

    const colors: ColorMap = {
      'G': GAME_CONSTANTS.ENEMIES.TROLL.COLOR, // Dark olive green
      'D': '#2F4F2F', // Darker green
      ' ': 'transparent',
    };

    pixels.forEach((row, y) => {
      [...row].forEach((pixel, x) => {
        const p = pixel as keyof ColorMap;
        if (p !== ' ') {
          ctx.fillStyle = colors[p];
          ctx.fillRect(x * 3, y * 3, 3, 3);
        }
      });
    });

    return sprite;
  }
}

export class EliteGoblin extends Enemy {
  public constructor(position: Position, ai: EnemyAI, gameEngine: GameEngine) {
    const stats: EnemyStats = {
      health: GAME_CONSTANTS.ENEMIES.ELITE_GOBLIN.HEALTH,
      maxHealth: GAME_CONSTANTS.ENEMIES.ELITE_GOBLIN.HEALTH,
      damage: GAME_CONSTANTS.ENEMIES.ELITE_GOBLIN.DAMAGE,
      speed: GAME_CONSTANTS.ENEMIES.ELITE_GOBLIN.SPEED,
      detectionRadius: GAME_CONSTANTS.ENEMIES.ELITE_GOBLIN.DETECTION_RADIUS,
      attackRange: GAME_CONSTANTS.ENEMIES.ELITE_GOBLIN.ATTACK_RANGE,
      attackCooldown: GAME_CONSTANTS.ENEMIES.ELITE_GOBLIN.ATTACK_COOLDOWN,
      experienceReward: GAME_CONSTANTS.ENEMIES.ELITE_GOBLIN.EXPERIENCE_REWARD,
    };

    super(position, EnemyType.ELITE_GOBLIN, stats, ai, gameEngine);
  }

  protected getEnemySize(): Size {
    return {
      width: GAME_CONSTANTS.ENEMIES.ELITE_GOBLIN.SIZE,
      height: GAME_CONSTANTS.ENEMIES.ELITE_GOBLIN.SIZE,
    };
  }

  protected getEnemyColor(): string {
    return GAME_CONSTANTS.ENEMIES.ELITE_GOBLIN.COLOR;
  }

  protected createSprite(): Sprite {
    const sprite = new Sprite(this.size);
    const ctx = sprite.context;

    // Elite goblin sprite - golden accents
    const pixels = [
      '  GGGG  ',
      ' GYGDYG ',
      ' GDDDGD ',
      '  GGGG  ',
      ' BBYBBB ',
      'BBBBBBBB',
      ' B YY B ',
      ' D YY D ',
    ];

    type ColorMap = {
      'G': string;
      'D': string;
      'B': string;
      'Y': string;
      ' ': string;
    };

    const colors: ColorMap = {
      'G': GAME_CONSTANTS.ENEMIES.ELITE_GOBLIN.COLOR,
      'D': '#2F4F2F',
      'B': '#654321',
      'Y': '#FFD700', // Gold accents
      ' ': 'transparent',
    };

    pixels.forEach((row, y) => {
      [...row].forEach((pixel, x) => {
        const p = pixel as keyof ColorMap;
        if (p !== ' ') {
          ctx.fillStyle = colors[p];
          ctx.fillRect(x * 3, y * 3, 3, 3);
        }
      });
    });

    return sprite;
  }
}

export class Wraith extends Enemy {
  public constructor(position: Position, ai: EnemyAI, gameEngine: GameEngine) {
    const stats: EnemyStats = {
      health: GAME_CONSTANTS.ENEMIES.WRAITH.HEALTH,
      maxHealth: GAME_CONSTANTS.ENEMIES.WRAITH.HEALTH,
      damage: GAME_CONSTANTS.ENEMIES.WRAITH.DAMAGE,
      speed: GAME_CONSTANTS.ENEMIES.WRAITH.SPEED,
      detectionRadius: GAME_CONSTANTS.ENEMIES.WRAITH.DETECTION_RADIUS,
      attackRange: GAME_CONSTANTS.ENEMIES.WRAITH.ATTACK_RANGE,
      attackCooldown: GAME_CONSTANTS.ENEMIES.WRAITH.ATTACK_COOLDOWN,
      experienceReward: GAME_CONSTANTS.ENEMIES.WRAITH.EXPERIENCE_REWARD,
    };

    super(position, EnemyType.WRAITH, stats, ai, gameEngine);
  }

  protected getEnemySize(): Size {
    return {
      width: GAME_CONSTANTS.ENEMIES.WRAITH.SIZE,
      height: GAME_CONSTANTS.ENEMIES.WRAITH.SIZE,
    };
  }

  protected getEnemyColor(): string {
    return GAME_CONSTANTS.ENEMIES.WRAITH.COLOR;
  }

  protected createSprite(): Sprite {
    const sprite = new Sprite(this.size);
    const ctx = sprite.context;

    // Wraith sprite - ethereal and dark
    const pixels = [
      '   PP    ',
      '  PPPP   ',
      ' PDDDPP  ',
      ' PDDDPP  ',
      '  PPPP   ',
      ' PPPPPP  ',
      'PPPPPPPP ',
      ' P PP P  ',
    ];

    type ColorMap = {
      'P': string;
      'D': string;
      ' ': string;
    };

    const colors: ColorMap = {
      'P': GAME_CONSTANTS.ENEMIES.WRAITH.COLOR,
      'D': '#1a1a1a',
      ' ': 'transparent',
    };

    pixels.forEach((row, y) => {
      [...row].forEach((pixel, x) => {
        const p = pixel as keyof ColorMap;
        if (p !== ' ') {
          ctx.fillStyle = colors[p];
          ctx.fillRect(x * 3, y * 3, 3, 3);
        }
      });
    });

    return sprite;
  }
}

export class DungeonBoss extends Enemy {
  public constructor(position: Position, ai: EnemyAI, gameEngine: GameEngine) {
    const stats: EnemyStats = {
      health: GAME_CONSTANTS.ENEMIES.DUNGEON_BOSS.HEALTH,
      maxHealth: GAME_CONSTANTS.ENEMIES.DUNGEON_BOSS.HEALTH,
      damage: GAME_CONSTANTS.ENEMIES.DUNGEON_BOSS.DAMAGE,
      speed: GAME_CONSTANTS.ENEMIES.DUNGEON_BOSS.SPEED,
      detectionRadius: GAME_CONSTANTS.ENEMIES.DUNGEON_BOSS.DETECTION_RADIUS,
      attackRange: GAME_CONSTANTS.ENEMIES.DUNGEON_BOSS.ATTACK_RANGE,
      attackCooldown: GAME_CONSTANTS.ENEMIES.DUNGEON_BOSS.ATTACK_COOLDOWN,
      experienceReward: GAME_CONSTANTS.ENEMIES.DUNGEON_BOSS.EXPERIENCE_REWARD,
    };

    super(position, EnemyType.DUNGEON_BOSS, stats, ai, gameEngine);
  }

  protected getEnemySize(): Size {
    return {
      width: GAME_CONSTANTS.ENEMIES.DUNGEON_BOSS.SIZE,
      height: GAME_CONSTANTS.ENEMIES.DUNGEON_BOSS.SIZE,
    };
  }

  protected getEnemyColor(): string {
    return GAME_CONSTANTS.ENEMIES.DUNGEON_BOSS.COLOR;
  }

  protected createSprite(): Sprite {
    const sprite = new Sprite(this.size);
    const ctx = sprite.context;

    // Boss sprite - large and imposing
    const pixels = [
      '    RRRRRR    ',
      '   RRRRRRRR   ',
      '  RRDDRRDDRF  ',
      '   RRRRRRRR   ',
      '    RRRRRR    ',
      '  RRRFRRFRRR  ',
      ' RRRRRRRRRRRR ',
      'RRRRRRRRRRRRRR',
      ' RR RR  RR RR ',
      ' FF FF  FF FF ',
    ];

    type ColorMap = {
      'R': string;
      'D': string;
      'F': string;
      ' ': string;
    };

    const colors: ColorMap = {
      'R': GAME_CONSTANTS.ENEMIES.DUNGEON_BOSS.COLOR,
      'D': '#2a0000',
      'F': '#ff0000',
      ' ': 'transparent',
    };

    pixels.forEach((row, y) => {
      [...row].forEach((pixel, x) => {
        const p = pixel as keyof ColorMap;
        if (p !== ' ') {
          ctx.fillStyle = colors[p];
          ctx.fillRect(x * 4, y * 4, 4, 4);
        }
      });
    });

    return sprite;
  }
}

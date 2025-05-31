export const GAME_CONSTANTS = {
  CANVAS: {
    WIDTH: 1024,
    HEIGHT: 768,
  },
  COLORS: {
    BACKGROUND: '#000000',
    PLAYER: '#FFFFFF',
    WALL: '#444444',
    FLOOR: '#222222',
    FLESH: '#FFD700',
    CLOTHES: '#FF0000',
    BOOTS: '#000000',
    ROOM: '#222222',
    ROOM_WALL: '#444444',
  },
  TILE_SIZE: 36, // Larger tiles for better visibility
  CAMERA: {
    SMOOTHING_FACTOR: 0.1, // How smoothly the camera follows the player (0 = instant, 1 = no movement)
  },
  PLAYER: {
    SIZE: 24,
    SPEED: 4,
    MAX_SPEED: 6, // Maximum velocity
    ACCELERATION: 0.5, // How quickly the player accelerates
    FRICTION: 0.3, // How quickly the player slows down
    INITIAL_HEALTH: 100,
    ATTACK: {
      RANGE: 40,
      COOLDOWN: 400, // milliseconds
      ANIMATION_DURATION: 200, // milliseconds
    }
  },
  MAZE: {
    ROOM_GENERATION: {
      MIN_ROOM_SIZE: 3,
      MAX_ROOM_SIZE: 7,
      ROOM_ATTEMPTS: 10,
      MIN_ROOM_COUNT: 20,
      MAX_ROOM_COUNT: 40,
    },
    SIZE_MULTIPLIER: 5, // How much bigger the maze should be compared to canvas
  },
  INVENTORY: {
    MAX_SLOTS: 30,
    HOTBAR_SLOTS: 10,
  },
  ITEMS: {
    COLORS: {
      COMMON: '#FFFFFF',
      UNCOMMON: '#00FF00',
      RARE: '#0080FF',
      EPIC: '#8000FF',
      LEGENDARY: '#FF8000',
      BACKGROUND: '#2D2D2D',
      BORDER: '#555555',
      SELECTED: '#FFFF00',
    },
    DROP_CHANCE: 1.0, // 100% chance for loot generation to guarantee dungeon loot appears
    DROP: {
      SIZE: {
        WIDTH: 18,
        HEIGHT: 18,
      },
      LIFETIME: 30000, // 30 seconds in milliseconds
      COLLECTION_RADIUS: 36,
      ANIMATION: {
        BOB_SPEED: 0.1,
        BOB_OFFSET_LIMIT: 2,
      },
      VISUAL: {
        PADDING: 2,
        SHADOW_BLUR: 8,
        BORDER_WIDTH: 1,
        BORDER_COLOR: '#000000',
      },
      TEXT: {
        QUANTITY_FONT: '8px Arial',
        QUANTITY_COLOR: '#FFFFFF',
        HINT_FONT: '10px Arial',
        HINT_COLOR: '#FFFFFF',
        HINT_OFFSET: 5,
        QUANTITY_OFFSET: 2,
      },
      EXPIRATION: {
        WARNING_TIME: 5000, // 5 seconds before expiration
        PULSE_SPEED: 0.01,
      },
    },
  },
  LOOT_GENERATION: {
    POSITION_SPREAD: 48,
    ROOM_LOOT_CHANCE: 0.8, // High chance for room loot
    PATH_LOOT_PERCENTAGE: 0.12, // 12% of path cells get loot
    INTERSECTION_BASE_CHANCE: 0.3, // Base chance for intersection loot
    END_BONUS_RADIUS: 192, // Radius for end area bonus loot
    END_BONUS_COUNT: 8, // Number of bonus items near end
  },
  ITEM_GENERATION: {
    MAX_RANDOM_ITEMS: 3,
    QUEST_REWARD_COUNT: 2,
    DUNGEON_LOOT_COUNT: 4,
    STARTER_ITEMS: ['rusty_sword', 'health_potion', 'healing_herb'],
    RARITY_WEIGHTS: {
      BASE: {
        COMMON: 0.7,
        UNCOMMON: 0.2,
        RARE: 0.08,
        EPIC: 0.02,
        LEGENDARY: 0.0,
      },
      LEVEL_MODIFIERS: {
        COMMON: 0.05,
        UNCOMMON: 0.02,
        RARE: 0.02,
        EPIC: 0.01,
        LEGENDARY: 0.005,
      },
      MINIMUMS: {
        COMMON: 0.3,
      },
      MAXIMUMS: {
        UNCOMMON: 0.4,
        RARE: 0.2,
        EPIC: 0.08,
        LEGENDARY: 0.02,
      },
    },
    SHOP_RARITY: {
      BASIC: {
        common: 6,
        uncommon: 2,
        rare: 1,
      },
      ADVANCED: {
        uncommon: 4,
        rare: 3,
        epic: 2,
        legendary: 1,
      },
    },
  },
  CONTROLS: {
    INVENTORY_TOGGLE: 'i',
    HELP_TOGGLE: 'h',
    COLLECT_ITEM: 'e',
    PAUSE: 'p',
    DEBUG_INFO: 'f3',
    ATTACK: ' ' // Space key for attack
  },
  UI: {
    INVENTORY: {
      HOTBAR: {
        BOTTOM_MARGIN: 20,
        BACKGROUND_COLOR: 'rgba(0, 0, 0, 0.7)',
        TEXT_COLOR: '#FFFFFF',
        TEXT_FONT: '12px Arial',
        TEXT_OFFSET: 5,
      },
      PANEL: {
        BACKGROUND_COLOR: 'rgba(45, 45, 45, 0.95)',
        TITLE_HEIGHT: 30,
        TITLE_COLOR: '#FFFFFF',
        TITLE_FONT: '16px Arial',
        TITLE_OFFSET: 20,
        BORDER_WIDTH: 2,
      },
      EQUIPMENT: {
        PANEL_X: 50,
        PANEL_Y: 50,
        GRID_COLS: 3,
        GRID_ROWS: 4,
      },
      SLOT: {
        ITEM_MARGIN: 4,
        ITEM_BORDER_COLOR: '#000000',
        ITEM_BORDER_WIDTH: 1,
        QUANTITY_COLOR: '#FFFFFF',
        QUANTITY_FONT: '10px Arial',
        QUANTITY_OFFSET: 2,
        DURABILITY: {
          BAR_HEIGHT: 2,
          BAR_OFFSET: 6,
          BACKGROUND_COLOR: '#333333',
          HIGH_COLOR: '#00FF00',
          MEDIUM_COLOR: '#FFFF00',
          LOW_COLOR: '#FF0000',
          HIGH_THRESHOLD: 0.5,
          MEDIUM_THRESHOLD: 0.25,
        },
      },
    },
    ITEM_TYPE_COLORS: {
      WEAPON: '#8B4513',    // Brown
      ARMOR: '#696969',     // Gray
      RESOURCE: '#228B22',  // Green
      CONSUMABLE: '#4169E1', // Blue
      ARTIFACT: '#FFD700',  // Gold
      DEFAULT: '#FFFFFF',   // White
    },
    HELP: {
      BACKGROUND_COLOR: 'rgba(20, 20, 20, 0.95)',
      BORDER_COLOR: '#555555',
      BORDER_WIDTH: 2,
      TITLE_COLOR: '#00FF00',
      TITLE_FONT: '18px Arial',
      TITLE_OFFSET: 30,
      TEXT_COLOR: '#FFFFFF',
      TEXT_FONT: '12px Arial',
      HEADER_COLOR: '#FFD700',
      CONTROL_COLOR: '#CCCCCC',
      CONTENT_START_Y: 50,
      LINE_HEIGHT: 16,
      PADDING: 20,
      INDENT: 40,
      HINT_BUTTON: {
        X: 10,
        Y: 50,
        WIDTH: 30,
        HEIGHT: 30,
        BACKGROUND_COLOR: 'rgba(0, 0, 0, 0.7)',
        BORDER_COLOR: '#555555',
        BORDER_WIDTH: 2,
        TEXT_COLOR: '#FFFFFF',
        TEXT_FONT: '16px Arial',
      },
    },
    OVERLAY_UI: {
      STATS: {
        BACKGROUND_COLOR: 'rgba(0, 0, 0, 0.8)',
        BORDER_COLOR: '#555555',
        BORDER_WIDTH: 2,
        TITLE: 'Player Stats',
        TITLE_COLOR: '#00FF00',
        TITLE_FONT: '14px Arial',
        TITLE_OFFSET: 20,
        TEXT_COLOR: '#FFFFFF',
        TEXT_FONT: '12px Arial',
        LINE_HEIGHT: 20,
        FIRST_STAT_OFFSET: 45,
        WIDTH: 200,
        HEIGHT: 200,
        PADDING: 10,
        BAR_HEIGHT: 8,
        BAR_SPACING: 15,
        HEALTH_COLOR: '#FF0000',
        MANA_COLOR: '#4169E1',
        BAR_BACKGROUND_COLOR: '#333333',
        BAR_BORDER_COLOR: '#555555',
        BAR_BORDER_WIDTH: 1,
      },
      BAR_HEIGHT: 8,
      BAR_BACKGROUND_COLOR: '#333333',
      BAR_BORDER_COLOR: '#555555',
      HEALTH_HIGH_COLOR: '#00FF00',
      HEALTH_MEDIUM_COLOR: '#FFFF00',
      HEALTH_LOW_COLOR: '#FF0000',
      MANA_COLOR: '#0080FF',
    },
  },
  PARTICLES: {
    TRAIL: {
      SPAWN_RATE: 3, // Particles per frame when moving
      LIFETIME: 30, // Frames
      SIZE: {
        MIN: 0.5,
        MAX: 2,
      },
      COLOR: '#FFD700',
      ALPHA: 0.8,
      DECAY: 0.03,
    },
    EXPLOSION: {
      COUNT: 8,
      LIFETIME: 45, // Frames
      SIZE: {
        MIN: 2,
        MAX: 6,
      },
      COLORS: ['#FFD700', '#FF6B35', '#F7931E', '#FFEB3B', '#FF9800', '#FFC107'],
      SPEED: {
        MIN: 2,
        MAX: 6,
      },
      GRAVITY: 0.1,
      DECAY: 0.02,
    },
  },
  ENEMIES: {
    GOBLIN: {
      SIZE: 24,
      HEALTH: 50,
      DAMAGE: 15,
      SPEED: 1.5,
      DETECTION_RADIUS: 120,
      ATTACK_RANGE: 30,
      ATTACK_COOLDOWN: 1000, // milliseconds
      COLOR: '#8B4513',
      EXPERIENCE_REWARD: 25,
    },
    SKELETON: {
      SIZE: 27,
      HEALTH: 75,
      DAMAGE: 20,
      SPEED: 2.0,
      DETECTION_RADIUS: 150,
      ATTACK_RANGE: 36,
      ATTACK_COOLDOWN: 800,
      COLOR: '#F5F5DC',
      EXPERIENCE_REWARD: 35,
    },
    SPIDER: {
      SIZE: 21,
      HEALTH: 30,
      DAMAGE: 10,
      SPEED: 2.5,
      DETECTION_RADIUS: 90,
      ATTACK_RANGE: 24,
      ATTACK_COOLDOWN: 600,
      COLOR: '#4B0082',
      EXPERIENCE_REWARD: 15,
    },
    TROLL: {
      SIZE: 36,
      HEALTH: 150,
      DAMAGE: 35,
      SPEED: 0.8,
      DETECTION_RADIUS: 180,
      ATTACK_RANGE: 45,
      ATTACK_COOLDOWN: 1500,
      COLOR: '#556B2F',
      EXPERIENCE_REWARD: 75,
    },
    ATTACK: {
      ANIMATION_DURATION: 400, // milliseconds
      PARTICLE_COUNT: 5,
      COLORS: {
        GOBLIN: '#8B4513',
        SKELETON: '#F5F5DC',
        SPIDER: '#4B0082',
        TROLL: '#556B2F'
      }
    },
    SPAWN: {
      ROOM_CHANCE: 0.7, // 70% chance for enemies in rooms
      PATH_CHANCE: 0.2, // 20% chance for enemies on paths
      MAX_ENEMIES_PER_ROOM: 3,
      MAX_ENEMIES_PER_PATH_SECTION: 1,
      MIN_DISTANCE_FROM_START: 225, // pixels
      RESPAWN_TIME: 30000, // 30 seconds
    },
    AI: {
      PATHFINDING: {
        MAX_SEARCH_DISTANCE: 300,
        UPDATE_INTERVAL: 500, // milliseconds
      },
      PATROL: {
        POINT_COUNT: 3,
        WAIT_TIME: 2000, // milliseconds
        PATROL_RADIUS: 150,
      },
      RANDOM: {
        DIRECTION_CHANGE_INTERVAL: 2000, // milliseconds
        MOVEMENT_PROBABILITY: 0.8,
      },
    },
    RENDERING: {
      SHADOW: {
        COLOR: 'rgba(0, 0, 0, 0.3)',
        OFFSET: {
          SMALL: {
            X: 4,
            Y: 0,
          },
          MEDIUM: {
            X: 6,
            Y: 6,
          },
          LARGE: {
            X: 10,
            Y: 10,
          },
        },
        SCALE: {
          SMALL: {
            X: 0.6,
            Y: 0.3,
          },
          MEDIUM: {
            X: 0.7,
            Y: 0.35,
          },
          LARGE: {
            X: 0.8,
            Y: 0.4,
          },
        },
      },
    },
  },
  FOG_OF_WAR: {
    TILE_SIZE: 30,
    VISIBILITY_RADIUS: 350,
    EXPONENTIAL_FACTOR: 0.8, // Higher values make fog thicker at the edges
    GRADIENT_STOPS: {
      INNER: {
        POSITION: 0,
        COLOR: 'rgba(0, 0, 0, 0)'
      },
      MIDDLE: {
        POSITION: 0.3,
        COLOR: 'rgba(0, 0, 0, 0.1)'
      },
      OUTER: {
        POSITION: 1,
        COLOR: 'rgba(0, 0, 0, 1)'
      }
    },
    FOG_COLOR: 'rgba(0, 0, 0, 1)'
  },
} as const;

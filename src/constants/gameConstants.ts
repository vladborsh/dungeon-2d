export const GAME_CONSTANTS = {
  CANVAS: {
    WIDTH: 800,
    HEIGHT: 600,
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
  TILE_SIZE: 24, // Smaller tiles for a more intricate maze
  PLAYER: {
    SIZE: 16,
    SPEED: 5,
    MAX_SPEED: 6, // Maximum velocity
    ACCELERATION: 0.5, // How quickly the player accelerates
    FRICTION: 0.3, // How quickly the player slows down
    INITIAL_HEALTH: 100,
  },
  MAZE: {
    ROOM_GENERATION: {
      MIN_ROOM_SIZE: 3,
      MAX_ROOM_SIZE: 7,
      ROOM_ATTEMPTS: 10,
      MIN_ROOM_COUNT: 3,
      MAX_ROOM_COUNT: 8,
    },
  },
} as const;

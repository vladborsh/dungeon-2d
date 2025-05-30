# Dungeon 2D Game

A TypeScript-based 2D dungeon crawler game with procedurally generated levels, enemy AI, and loot systems.

## Features

- Procedurally generated maze dungeons
- Multiple enemy types with different AI behaviors
- Inventory and loot system
- Particle effects and smooth camera movement
- Real-time combat system

## Development

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

The game will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

### Linting

```bash
npm run lint
npm run lint:fix
```

## Deployment

### Netlify Deployment

This project is configured for automatic deployment to Netlify.

#### Manual Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy using Netlify CLI:
   ```bash
   npx netlify deploy --prod --dir=dist
   ```

#### Automatic Deployment

The project includes a `netlify.toml` configuration file that enables automatic deployment when pushed to your Git repository.

1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy automatically on push

### Environment Variables

No environment variables are required for basic deployment.

## Project Structure

- `src/` - Source TypeScript files
- `public/` - Static assets
- `dist/` - Built files (generated)
- `netlify.toml` - Netlify configuration

## Game Controls

- **Arrow Keys / WASD** - Move player
- **Space** - Attack
- **I** - Toggle inventory
- **H** - Toggle help

## Technologies Used

- TypeScript
- Webpack
- HTML5 Canvas
- ESLint for code quality
- Netlify for deployment

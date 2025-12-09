# Balehalla Discord Bot

A Discord bot for the Balehalla Breadwinners town community. This bot provides tools for managing pearls on a virtual map, tracking their locations, colors, and sectors.

## Features

- **Pearl Management**: Add, list, and track pearls on a 2D coordinate map
- **Color Tracking**: Pearls can be assigned various colors (White, Black, Red, Yellow, Green, Blue, Cyan, Magenta)
- **Sector Organization**: Automatically categorizes pearls by their sector (NorthWest, NorthEast, SouthWest, SouthEast)
- **Daily Reset**: Automatically clears all pearls at midnight UTC
- **Map Visualization**: Display pearls on a visual map
- **Filtering**: Filter pearls by color and/or sector for easy searching

## Commands

- `/add-pearl` - Add a new pearl to the map with specified coordinates and color
- `/list-pearls` - Display all pearls, optionally filtered by sector and/or color
- `/show-map` - Display a visual representation of all pearls on the map
- `/clear-pearl` - Remove a pearl from the map

## Requirements

### System Requirements
- Node.js 18+ (for Discord.js v14 compatibility)
- npm or yarn package manager

### Dependencies
- **discord.js** (^14.25.1) - Discord API wrapper
- **cron** (^4.3.5) - Scheduling library for daily resets
- **jimp** (^1.6.0) - Image processing for map visualization

### Development Dependencies
- **TypeScript** (^5.3.3) - Language and compiler
- **tsx** (^4.7.0) - TypeScript executor for development
- **@types/node** (^20.10.6) - Node.js type definitions

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Balehalla
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure the bot**
   - Update `src/config.json` with your Discord credentials:
     ```json
     {
       "token": "your-bot-token",
       "clientId": "your-client-id",
       "guildId": "your-guild-id"
     }
     ```
   - Obtain these values from the [Discord Developer Portal](https://discord.com/developers/applications)

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Start the bot**
   ```bash
   npm start
   ```

## Development

For development with hot-reload:
```bash
npm run dev
```

To deploy slash commands:
```bash
npm run deploy-commands
```

## Data Storage

- Pearl data is stored in `pearls.json` in the project root
- Each pearl contains: x coordinate, y coordinate, color, and sector
- The file is automatically created if it doesn't exist

## Architecture

- **Models**: Define TypeScript interfaces and enums (`Command`, `CustomClient`, `Pearl`)
- **Commands**: Slash commands organized in the `commands/pearls/` directory
- **Utils**: Helper functions for number formatting and other utilities
- **Images**: Assets used by the bot (including map visualization)

## Coordinate System

- **X-axis**: Range from -160 to +160
- **Y-axis**: Range from -160 to +160
- **Origin**: (0, 0) is at the center
- **Sectors**:
  - NorthWest: x < 0, y >= 0
  - NorthEast: x >= 0, y >= 0
  - SouthWest: x < 0, y < 0
  - SouthEast: x >= 0, y < 0

## License

ISC

## Author

Narolithz

# Balehalla Discord Bot

A Discord bot for the Balehalla Breadwinners town community. This bot provides tools for managing pearls on a virtual map, tracking their locations, colors, and sectors.

## Features

- **Pearl Management**: Add, list, and track pearls on a 2D coordinate map
- **Color Tracking**: Pearls can be assigned various colors (White, Black, Red, Yellow, Green, Blue, Cyan, Magenta)
- **Daily Reset**: Automatically clears all pearls at midnight UTC
- **Map Visualization**: Display pearls on a visual map
- **Filtering**: Filter pearls by color and/or sector for easy searching

## Commands

- `/add-pearl` - Add a new pearl to the map with specified coordinates and color
- `/list-pearls` - Display all pearls, optionally filtered by sector and/or color
- `/show-map` - Display a visual representation of all pearls on the map
- `/clear-pearl` - Remove a pearl from the map
- `/pearl-help` - Displays help information for pearl commands

## Requirements

### System Requirements
- Node.js 18+ (for Discord.js v14 compatibility)
- npm or yarn package manager

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
       "guildId": "your-guild-id",
       "minCoord": -160,
       "maxCoord": 160
     }
     ```
   - Obtain these values from the [Discord Developer Portal](https://discord.com/developers/applications)

4. **Build the project**

   ```bash
   npm run build
   ```

5. **Deploy the commands**

   ```bash
   npm run deploy-commands
   ```

6. **Start the bot**

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

- Pearl data is stored in `pearls.json` and `pearls_yesterday.json` in the project root
- Each pearl contains: x coordinate, y coordinate, color, and sector
- The files are automatically created if it doesn't exist

## Coordinate System

- X-axis: Range from -160 to +160 (left → right)
- Y-axis: Range from -160 to +160 (top → bottom)
- Origin: (0, 0) is at the center
- Sectors:
  - TopLeft: x < 0, y < 0
  - TopRight: x >= 0, y < 0
  - BottomLeft: x < 0, y >= 0
  - BottomRight: x >= 0, y >= 0
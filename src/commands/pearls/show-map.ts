
import { SlashCommandBuilder, ChatInputCommandInteraction, AttachmentBuilder } from 'discord.js';
import { promises as fs } from 'fs';
import path from 'path';
import { Pearl } from '../../models/Pearl';
import {Jimp, JimpMime, rgbaToInt} from 'jimp';

const pearlsFile = path.join(process.cwd(), 'pearls.json');
const mapFile = path.join(process.cwd(), 'images', 'balehalla.bmp');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('show-map')
        .setDescription('Displays a list of all pearls and a map with dots'),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        try {
            let pearls: Pearl[] = [];
            try {
                const data = await fs.readFile(pearlsFile, 'utf8');
                pearls = JSON.parse(data);
            } catch {
                pearls = [];
            }

            if (pearls.length === 0) {
                await interaction.reply('No pearls found.');
                return;
            }


            // Read the base map image
            const image = await Jimp.read(mapFile);
            const width = image.width;
            const height = image.height;

            // Map coords: worldX/worldY in [-160, 160]
            const worldMin = -160;
            const worldMax = 160;
            const worldSpan = worldMax - worldMin; // 320

            // For each pearl, compute pixel position and draw a small filled circle
            const dotRadius = Math.max(1, Math.round(Math.min(width, height) / 256));

            function worldToPixel(px: number, py: number): { x: number; y: number } {
                // Map world X from [-160,160] to [0, width-1]
                const x = Math.round(((px - worldMin) / worldSpan) * (width - 1));
                // Map world Y from [-160,160] to [0, height-1]
                // We flip Y so that higher world Y appears toward top of image
                const y = Math.round(((worldMax - py) / worldSpan) * (height - 1));
                return { x, y };
            }

            function parseColor(colorStr: string): number {
                // Accept formats like '#RRGGBB' or 'RRGGBB' or decimal
                try {
                    let s = colorStr.toString().trim();
                    if (s.startsWith('#')) s = s.slice(1);
                    // named colors mapping (covers PearlColor enum)
                    const named: Record<string, string> = {
                        white: 'ffffff',
                        black: '000000',
                        red: 'ff0000',
                        yellow: 'ffff00',
                        green: '00ff00',
                        blue: '0000ff',
                        cyan: '00ffff',
                        magenta: 'ff00ff',
                    };
                    if (named[s.toLowerCase()]) s = named[s.toLowerCase()];
                    // If already numeric, return as int
                    if (/^[0-9]+$/.test(s)) return parseInt(s, 10);
                    // Otherwise treat as hex
                    if (/^[0-9a-fA-F]{6}$/.test(s)) return parseInt(s, 16);
                } catch (e) {
                    // ignore
                }
                // default white
                return 0xffffff;
            }

            for (const pearl of pearls) {
                const { x: px, y: py } = worldToPixel(pearl.x, pearl.y);
                const hex = parseColor(pearl.color || '#ffffff');
                const r = (hex >> 16) & 0xff;
                const g = (hex >> 8) & 0xff;
                const b = hex & 0xff;

                // draw filled circle
                for (let dy = -dotRadius; dy <= dotRadius; dy++) {
                    for (let dx = -dotRadius; dx <= dotRadius; dx++) {
                        const dist2 = dx * dx + dy * dy;
                        if (dist2 <= dotRadius * dotRadius) {
                            const sx = px + dx;
                            const sy = py + dy;
                            if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
                                image.setPixelColor(rgbaToInt(r, g, b, 255), sx, sy);
                            }
                        }
                    }
                }
            }

            const buffer = await image.getBuffer(JimpMime.png)
            const attachment = new AttachmentBuilder(buffer, { name: 'pearls-map.png' });

            await interaction.reply({ files: [attachment] });
        }
        catch (error) {
            console.error('Error executing show-map command:', error);
            await interaction.reply('An error occurred while processing your request.');
        }
    }
};


import { SlashCommandBuilder, ChatInputCommandInteraction, AttachmentBuilder } from 'discord.js';
import { promises as fs } from 'fs';
import path from 'path';
import { Pearl } from '../../models/Pearl';
import { PearlColor } from "../../models/PearlColor";
import { Jimp, JimpMime, rgbaToInt } from 'jimp';

const pearlsFile = path.join(process.cwd(), 'pearls.json');
const mapFile = path.join(process.cwd(), 'images', 'balehalla.bmp');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('show-map')
        .setDescription('Displays a list of all pearls and a map with dots')
        .addStringOption((option) =>
            option
                .setName('filter-color')
                .setDescription('Filter pearls by color (comma-separated for multiple)')
                .setRequired(false)
                .addChoices(
                    ...Object.entries(PearlColor).map(([key, value]) => ({
                        name: key.charAt(0).toUpperCase() + key.slice(1),
                        value: value,
                    }))
                ),
        ),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply();
        try {
            let pearls: Pearl[] = [];
            try {
                const data = await fs.readFile(pearlsFile, 'utf8');
                pearls = JSON.parse(data);
            } catch {
                pearls = [];
            }

            const filterColor = interaction.options.getString('filter-color');
            if (filterColor) {
                pearls = pearls.filter(pearl => pearl.color === filterColor);
            }

            if (pearls.length === 0) {
                await interaction.editReply('No pearls found.');
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
            const dotRadius = Math.max(4, Math.round(Math.min(width, height) / 128));
            const borderRadius = dotRadius + 2;

            // Interior city rectangle in the full map image (pixels)
            const interior = {
                x0: 51,
                y0: 59,
                x1: 945,
                y1: 898,
            };
            const interiorWidth = interior.x1 - interior.x0;
            const interiorHeight = interior.y1 - interior.y0;

            function worldToPixel(px: number, py: number): { x: number; y: number } {
                // Map world X from [-160,160] to [interior.x0, interior.x1]
                const x = Math.round(interior.x0 + ((px - worldMin) / worldSpan) * (interiorWidth - 1));
                // Map world Y from [-160,160] to [interior.y0, interior.y1]
                // -160 (top) -> interior.y0, +160 (bottom) -> interior.y1
                const y = Math.round(interior.y0 + ((py - worldMin) / worldSpan) * (interiorHeight - 1));
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

                // draw border (dark/black outline)
                for (let dy = -borderRadius; dy <= borderRadius; dy++) {
                    for (let dx = -borderRadius; dx <= borderRadius; dx++) {
                        const dist2 = dx * dx + dy * dy;
                        if (dist2 <= borderRadius * borderRadius && dist2 > dotRadius * dotRadius) {
                            const sx = px + dx;
                            const sy = py + dy;
                            if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
                                image.setPixelColor(rgbaToInt(0, 0, 0, 255), sx, sy);
                            }
                        }
                    }
                }

                // draw filled circle with pearl color
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

            await interaction.editReply({ files: [attachment] });
        }
        catch (error) {
            console.error('Error executing show-map command:', error);
            await interaction.editReply('An error occurred while processing your request.');
        }
    }
};

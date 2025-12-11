import path from "path";
import { Pearl } from "../models/Pearl";
import { Jimp, JimpMime, rgbaToInt } from "jimp";
import { AttachmentBuilder } from "discord.js";

interface MapData {
    worldMin: number;
    worldMax: number;
    worldSpan: number;
    interior: {
        x0: number;
        y0: number;
        x1: number;
        y1: number;
    };
    interiorWidth: number;
    interiorHeight: number;
}

const worldToPixel = (px: number, py: number, mapData: MapData): { x: number; y: number } => {
    // Map world X from [-160,160] to [interior.x0, interior.x1]
    const x = Math.round(mapData.interior.x0 + ((px - mapData.worldMin) / mapData.worldSpan) * (mapData.interiorWidth - 1));
    // Map world Y from [-160,160] to [interior.y0, interior.y1]
    // -160 (top) -> interior.y0, +160 (bottom) -> interior.y1
    const y = Math.round(mapData.interior.y0 + ((py - mapData.worldMin) / mapData.worldSpan) * (mapData.interiorHeight - 1));
    return { x, y };
}

const parseColor = (colorStr: string): number => {
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
const generatePearlMap = async (pearls: Pearl[]): Promise<AttachmentBuilder> => {
    const mapFile = path.join(process.cwd(), 'images', 'balehalla.bmp');
    let mapData: MapData = {
        worldMin: -160,
        worldMax: 160,
        worldSpan: 320,
        interior: {
            x0: 51,
            y0: 59,
            x1: 945,
            y1: 898,
        },
        interiorWidth: 945 - 51,
        interiorHeight: 898 - 59,
    };

    // Read the base map image
    const image = await Jimp.read(mapFile);
    const width = image.width;
    const height = image.height;

    // For each pearl, compute pixel position and draw a small filled circle
    const dotRadius = Math.max(4, Math.round(Math.min(width, height) / 128));
    const borderRadius = dotRadius + 2;

    for (const pearl of pearls) {
        const { x: px, y: py } = worldToPixel(pearl.x, pearl.y, mapData);
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
    return new AttachmentBuilder(buffer, { name: 'pearls-map.png' });
}

export { generatePearlMap };

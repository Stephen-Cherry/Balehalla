import path from "path";
import { Pearl } from "../models/Pearl";
import { Jimp, JimpInstance, JimpMime, rgbaToInt } from "jimp";
import { AttachmentBuilder } from "discord.js";
import { MapData } from "../models/MapData";
import { GetPearlHexColor } from "../models/PearlColor";

const MAP_FILE_PATH = path.join(process.cwd(), 'images', 'balehalla.bmp');

const MAP_DATA: MapData = {
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

const worldToPixel = (px: number, py: number, mapData: MapData): { x: number; y: number } => {
    // Map world X from [-160,160] to [interior.x0, interior.x1]
    // -160 (left) -> interior.x0, +160 (right) -> interior.x1
    const x = Math.round(mapData.interior.x0 + ((px - mapData.worldMin) / mapData.worldSpan) * (mapData.interiorWidth - 1));
    // Map world Y from [-160,160] to [interior.y0, interior.y1]
    // -160 (top) -> interior.y0, +160 (bottom) -> interior.y1
    const y = Math.round(mapData.interior.y0 + ((py - mapData.worldMin) / mapData.worldSpan) * (mapData.interiorHeight - 1));
    return { x, y };
}

const drawCircle = (image: JimpInstance, centerX: number, centerY: number, radius: number, color: number) => {
    const r = (color >> 16) & 0xff;
    const g = (color >> 8) & 0xff;
    const b = color & 0xff;
    const intColor = rgbaToInt(r, g, b, 255);

    const width = image.width;
    const height = image.height;

    for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
            if (dx * dx + dy * dy <= radius * radius) {
                const x = centerX + dx;
                const y = centerY + dy;
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    image.setPixelColor(intColor, x, y);
                }
            }
        }
    }
};

const generatePearlMap = async (pearls: Pearl[]): Promise<AttachmentBuilder> => {
    // Read the base map image
    const image: JimpInstance = await Jimp.read(MAP_FILE_PATH) as JimpInstance;

    // For each pearl, compute pixel position and draw a small filled circle
    const dotRadius = Math.max(4, Math.round(Math.min(image.width, image.height) / 128));
    const borderRadius = dotRadius + 2;

    for (const pearl of pearls) {
        const { x: px, y: py } = worldToPixel(pearl.x, pearl.y, MAP_DATA);
        const pearlColor = GetPearlHexColor(pearl.color);

        // Draw border
        drawCircle(image, px, py, borderRadius, 0x000000); // Black border
        // Draw filled dot
        drawCircle(image, px, py, dotRadius, pearlColor);
    }

    const buffer = await image.getBuffer(JimpMime.png)
    return new AttachmentBuilder(buffer, { name: 'pearls-map.png' });
}

export { generatePearlMap };

import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { Pearl } from '../../models/Pearl';
import { PearlColor } from "../../models/PearlColor";
import { PearlSector } from "../../models/PearlSector";
import { addNumberPrefix } from '../../utils/numberFormatter';
import { minCoord, maxCoord } from '../../config.json';

const pearlsFile = path.join(process.cwd(), 'pearls.json');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('add-pearl')
		.setDescription('Adds a pearl to the list.')
		.addIntegerOption((option) =>
			option
                .setName('x')
                .setDescription('The X coordinate of the pearl')
                .setRequired(true)
                .setMinValue(minCoord)
                .setMaxValue(maxCoord),
		)
		.addIntegerOption((option) =>
			option
				.setName('y')
				.setDescription('The Y coordinate of the pearl')
				.setRequired(true)
				.setMinValue(minCoord)
				.setMaxValue(maxCoord),
		)
		.addStringOption((option) =>
			option
				.setName('color')
				.setDescription('The color of the pearl')
				.setRequired(true)
				.addChoices(
					...Object.entries(PearlColor).map(([key, value]) => ({
						name: key.charAt(0).toUpperCase() + key.slice(1),
						value: value,
					}))
				),
		),
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		const x = interaction.options.getInteger('x');
		const y = interaction.options.getInteger('y');
		const color = interaction.options.getString('color') as PearlColor;

        if (x === null) {
            await interaction.reply('X coordinate is required.');
            return;
        }

        if (y === null) {
            await interaction.reply('Y coordinate is required.');
            return;
        }
        
        if (color === null) {
            await interaction.reply('Color is required.');
            return;
        }

		let pearls: Pearl[] = [];
		if (fs.existsSync(pearlsFile)) {
			const data = fs.readFileSync(pearlsFile, 'utf8');
			pearls = JSON.parse(data);
		}

        if (pearls.some(pearl => pearl.x === x && pearl.y === y)) {
            await interaction.reply(`A pearl already exists at (${addNumberPrefix(x)}, ${addNumberPrefix(y)}).`);
            return;
        }

        const sector = x >= 0 
            ? (y >= 0 ? PearlSector.NorthEast : PearlSector.SouthEast) 
            : (y >= 0 ? PearlSector.NorthWest : PearlSector.SouthWest);

		pearls.push({ x: x, y: y, color: color, sector: sector });
		fs.writeFileSync(pearlsFile, JSON.stringify(pearls, null, 2));
		await interaction.reply(`Added a ${color} pearl at (${addNumberPrefix(x)}, ${addNumberPrefix(y)}).`);
	},
};

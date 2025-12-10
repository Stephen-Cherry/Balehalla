import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { promises as fs } from 'fs';
import path from 'path';
import { Pearl } from '../../models/Pearl';
import { addNumberPrefix } from '../../utils/numberFormatter';
import { minCoord, maxCoord } from '../../config.json';

const pearlsFile = path.join(process.cwd(), 'pearls.json');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear-pearl')
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
        ),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const x = interaction.options.getInteger('x');
        const y = interaction.options.getInteger('y');

        if (x === null || y === null) {
            await interaction.reply('Both X and Y coordinates are required.');
            return;
        }

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

            const initialLength = pearls.length;
            pearls = pearls.filter(pearl => !(pearl.x === x && pearl.y === y));

            if (pearls.length === initialLength) {
                await interaction.reply(`No pearl found at (X: ${addNumberPrefix(x)}, Y: ${addNumberPrefix(y)}).`);
                return;
            }

            await fs.writeFile(pearlsFile, JSON.stringify(pearls, null, 2));
            await interaction.reply(`Cleared pearl at (X: ${addNumberPrefix(x)}, Y: ${addNumberPrefix(y)}).`);
        } catch (error) {
            console.error('Error clearing pearl:', error);
            await interaction.reply('An error occurred while clearing the pearl.');
        }
    },
};

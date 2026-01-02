import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { addNumberPrefix } from '../../utils/numberFormatter';
import { minCoord, maxCoord } from '../../config.json';
import { deletePearl } from '../../utils/mysqlService';
import { PearlSector } from '../../models/PearlSector';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear-pearl')
        .setDescription('Removes a pearl from the list.')
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
        await interaction.deferReply();
        const x = interaction.options.getInteger('x');
        const y = interaction.options.getInteger('y');

        if (x === null || y === null) {
            await interaction.editReply('Both X and Y coordinates are required.');
            return;
        }

        try {
            const sector = x >= 0
                ? (y >= 0 ? PearlSector.BottomRight : PearlSector.TopRight)
                : (y >= 0 ? PearlSector.BottomLeft : PearlSector.TopLeft);

            const affectedRows = await deletePearl(x, y, sector);

            if (affectedRows === 0) {
                await interaction.editReply(`No pearl found at (X: ${addNumberPrefix(x)}, Y: ${addNumberPrefix(y)}).`);
                return;
            }

            await interaction.editReply(`Cleared pearl at (X: ${addNumberPrefix(x)}, Y: ${addNumberPrefix(y)}).`);
        } catch (error) {
            console.error('Error clearing pearl:', error);
            await interaction.editReply('An error occurred while clearing the pearl.');
        }
    },
};

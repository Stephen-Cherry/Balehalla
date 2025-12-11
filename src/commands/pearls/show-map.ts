
import { SlashCommandBuilder, ChatInputCommandInteraction} from 'discord.js';
import { promises as fs } from 'fs';
import path from 'path';
import { Pearl } from '../../models/Pearl';
import { PearlColor } from "../../models/PearlColor";
import { generatePearlMap } from '../../utils/imageGenerator';

const pearlsFile = path.join(process.cwd(), 'pearls.json');

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
            const attachment = await generatePearlMap(pearls);
            await interaction.editReply({ files: [attachment] });
        }
        catch (error) {
            console.error('Error executing show-map command:', error);
            await interaction.editReply('An error occurred while processing your request.');
        }
    }
};

import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { promises as fs } from 'fs';
import path from 'path';
import { Pearl } from '../../models/Pearl';
import { PearlColor } from "../../models/PearlColor";
import { PearlSector } from "../../models/PearlSector";
import { addNumberPrefix } from '../../utils/numberFormatter';

const pearlsFile = path.join(process.cwd(), 'pearls.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('list-pearls')
        .setDescription('Displays a list of all pearls')
        .addStringOption((option) =>
            option
                .setName('filter-sector')
                .setDescription('Filter pearls by sector')
                .setRequired(false)
                .addChoices(
                    { name: '(-,+)', value: '(-,+)' },
                    { name: '(+,+)', value: '(+,+)' },
                    { name: '(-,-)', value: '(-,-)' },
                    { name: '(+,-)', value: '(+,-)' },
                ),
        )
        .addStringOption((option) =>
            option
                .setName('filter-color')
                .setDescription('Filter pearls by color')
                .setRequired(false)
                .addChoices(
                    ...Object.entries(PearlColor).map(([key, value]) => ({
                        name: key.charAt(0).toUpperCase() + key.slice(1),
                        value: value,
                    }))
                ),
        ),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        try {
            let pearls: Pearl[] = [];
            const filterColor = interaction.options.getString('filter-color');
            const filterSector = interaction.options.getString('filter-sector');

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

            if (filterSector) {
                pearls = pearls.filter(pearl => {
                    switch (filterSector) {
                        case '(-,+)':
                            return pearl.sector === PearlSector.NorthWest;
                        case '(+,+)':
                            return pearl.sector === PearlSector.NorthEast;
                        case '(-,-)':
                            return pearl.sector === PearlSector.SouthWest;
                        case '(+,-)':
                            return pearl.sector === PearlSector.SouthEast;
                        default:
                            return true;
                    };
                });
                if (pearls.length === 0) {
                    await interaction.reply(`No pearls found in sector ${filterSector}.`);
                    return;
                }
            }

            if (filterColor) {
                pearls = pearls.filter(pearl => pearl.color === filterColor);
                if (pearls.length === 0) {
                    await interaction.reply(`No pearls found with color ${filterColor}.`);
                    return;
                }
            }

            const pearlsByColor: Record<string, Pearl[]> = {};
            for (const pearl of pearls) {
                if (!pearlsByColor[pearl.color]) {
                    pearlsByColor[pearl.color] = [];
                }
                pearlsByColor[pearl.color].push(pearl);
            }

            for (const color in pearlsByColor) {
                pearlsByColor[color].sort((a, b) => a.x - b.x || a.y - b.y);
            }

            const embed = new EmbedBuilder()
                .setTitle('Pearl List')
                .setColor(0x00ff00)
                .setTimestamp();

            for (const color in pearlsByColor) {
                const coloredPearls = pearlsByColor[color];
                const pearlLocations = coloredPearls
                    .map(p => `(${addNumberPrefix(p.x)}, ${addNumberPrefix(p.y)})`)
                    .join('\n');

                embed.addFields({
                    name: `${color.charAt(0).toUpperCase() + color.slice(1)} (${coloredPearls.length})`,
                    value: pearlLocations || 'None',
                    inline: false,
                });
            }

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error listing pearls:', error);
            await interaction.reply('An error occurred while listing pearls.');
        }
    },
};

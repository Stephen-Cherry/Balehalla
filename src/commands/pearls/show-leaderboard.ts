
import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder} from 'discord.js';
import { getAllPearlsUsersCount as getUserWeekPearlCount } from '../../utils/mysqlService';
import { getSundayTimestamp } from '../../utils/dateUtils';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('show-leaderboard')
		.setDescription('Displays the pearl collection leaderboard for the current week.'),

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		await interaction.deferReply();
        
        const sundayTimestamp = getSundayTimestamp();
        const leaderboard = await getUserWeekPearlCount(sundayTimestamp);
        const leaderboardString = leaderboard.map((user, index) => `${index + 1}. ${user.user} - ${user.user_count}`).join('\n');

		const embed = new EmbedBuilder()
			.setColor(0x00aaff)
			.setTimestamp()
			.setTitle('Weekly Pearl Collection Leaderboard')
			.setDescription(leaderboardString || 'No pearls collected yet.');

		await interaction.editReply({ embeds: [embed] });
	},
};

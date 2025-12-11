import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, MessageFlags } from 'discord.js';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pearl-help')
		.setDescription('Displays help information for pearl commands.'),

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });
		const embed = new EmbedBuilder()
			.setTitle('Pearl Commands')
			.setColor(0x00aaff)
			.setDescription('Usage and details for available pearl commands')
			.addFields(
				{
					name: '/add-pearl',
					value:
						'**Usage:** `/add-pearl x:<X> y:<Y> color:<Color>`\nAdds a pearl to the list.\n• X,Y range: -160 to 160\n• Color: one of the predefined colors',
					inline: false,
				},
				{
					name: '/clear-pearl',
					value: '**Usage:** `/clear-pearl x:<X> y:<Y>`\nRemoves a pearl at the given coordinates.\n• X,Y range: -160 to 160',
					inline: false,
				},
				{
					name: '/list-pearls',
					value:
						'**Usage:** `/list-pearls [filter-sector:<Sector>] [filter-color:<Color>]`\nDisplays pearls; optional filters:\n• `filter-sector`: (-,+), (+,+), (-,-), (+,-)\n• `filter-color`: color name',
					inline: false,
				},
				{
					name: '/show-map',
					value: '**Usage:** `/show-map [filter-color:<Color>]`\nDisplays a visual map with pearls marked; optional filter:\n• `filter-color`: color name',
					inline: false,
				},
			)
			.setTimestamp();

		await interaction.editReply({ embeds: [embed] });
	},
};

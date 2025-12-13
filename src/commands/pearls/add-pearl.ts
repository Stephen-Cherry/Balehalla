import {
	SlashCommandBuilder,
	ChatInputCommandInteraction,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
	MessageFlags,
} from 'discord.js';
import fs from 'fs';
import path from 'path';
import { Pearl } from '../../models/Pearl';
import { PearlColor } from "../../models/PearlColor";
import { PearlSector } from "../../models/PearlSector";
import { addNumberPrefix } from '../../utils/numberFormatter';
import { minCoord, maxCoord } from '../../config.json';

const pearlsFile = path.join(process.cwd(), 'pearls.json');
const prevDayPearlsFile = path.join(process.cwd(), 'pearls_yesterday.json');


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
		await interaction.deferReply();
		const x = interaction.options.getInteger('x');
		const y = interaction.options.getInteger('y');
		const color = interaction.options.getString('color') as PearlColor;

		if (x === null) {
			await interaction.editReply('X coordinate is required.');
			return;
		}

		if (y === null) {
			await interaction.editReply('Y coordinate is required.');
			return;
		}

		if (color === null) {
			await interaction.editReply('Color is required.');
			return;
		}

		let pearls: Pearl[] = [];
		try {
			if (fs.existsSync(pearlsFile)) {
				const data = fs.readFileSync(pearlsFile, 'utf8');
				pearls = JSON.parse(data);
			}
		} catch {
			await interaction.editReply('Error reading pearls data.');
			return;
		}

		try {
			if (pearls.some(pearl => pearl.x === x && pearl.y === y)) {
				await interaction.editReply(`A pearl already exists at (${addNumberPrefix(x)}, ${addNumberPrefix(y)}).`);
				return;
			}
			if (fs.existsSync(prevDayPearlsFile)) {
				const prevData = fs.readFileSync(prevDayPearlsFile, 'utf8');
				const prevPearls: Pearl[] = JSON.parse(prevData);
				if (prevPearls.some(pearl => pearl.x === x && pearl.y === y && pearl.color === color)) {
					const yesId = `prev_yes_${interaction.id}`;
					const noId = `prev_no_${interaction.id}`;

					const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
						new ButtonBuilder().setCustomId(yesId).setLabel('Yes').setStyle(ButtonStyle.Success),
						new ButtonBuilder().setCustomId(noId).setLabel('No').setStyle(ButtonStyle.Danger),
					);

					await interaction.editReply({ content: `There is a ${color} pearl recorded at (${addNumberPrefix(x)}, ${addNumberPrefix(y)}) in yesterday's data. Are you sure you wish to add to today?`, components: [row] });

					const replyMsg = (await interaction.fetchReply());
					const buttonInteraction = await replyMsg.awaitMessageComponent({
						filter: (i: any) => i.user.id === interaction.user.id && (i.customId === yesId || i.customId === noId),
						componentType: ComponentType.Button,
						time: 60_000,
					});

					if (buttonInteraction.customId === noId) {
						await buttonInteraction.reply({ content: 'OK — not adding the pearl.', flags: MessageFlags.Ephemeral });
						await interaction.editReply({ content: `Add cancelled for (${addNumberPrefix(x)}, ${addNumberPrefix(y)}).`, components: [] });
						return;
					}

					if (buttonInteraction.customId === yesId) {
						await buttonInteraction.reply({ content: 'OK - Adding the pearl.', flags: MessageFlags.Ephemeral });
						addPearl(pearls, x, y, color);
						await interaction.editReply({ content: `Added a ${color} pearl at (${addNumberPrefix(x)}, ${addNumberPrefix(y)}).`, components: [] });
						return;
					}
				}
			}
			else {
				addPearl(pearls, x, y, color);
				await interaction.editReply(`Added a ${color} pearl at (${addNumberPrefix(x)}, ${addNumberPrefix(y)}).`);
			}
		}
		catch (err) {
			// timed out or other
			console.error('Error during add-pearl confirmation:', err);
			await interaction.editReply('An error occurred or no response received. Pearl not added.');
			return;
		}
	},
}

function addPearl(pearls: Pearl[], x: number, y: number, color: PearlColor): void {
	const sector = x >= 0
		? (y >= 0 ? PearlSector.BottomRight : PearlSector.TopRight)
		: (y >= 0 ? PearlSector.BottomLeft : PearlSector.TopLeft);

	pearls.push({ x: x, y: y, color: color, sector: sector });
	fs.writeFileSync(pearlsFile, JSON.stringify(pearls, null, 2));
}

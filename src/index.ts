import fs from 'node:fs';
import path from 'node:path';
import { Client, Collection, EmbedBuilder, Events, GatewayIntentBits, MessageFlags, TextChannel } from 'discord.js';
import { token, pearlChannelId } from './config.json';
import { Command } from './models/Command';
import { CustomClient } from './models/CustomClient';
import { CronJob } from 'cron';
import { deleteOldPearls, getAllPearlsUsersCount } from './utils/mysqlService';
import { getSundayTimestamp } from './utils/dateUtils';

const logFile = path.join(process.cwd(), 'bot.log');

const client = new Client({ intents: [GatewayIntentBits.Guilds] }) as CustomClient;

client.commands = new Collection();

client.once(Events.ClientReady, (readyClient) => {
	const timeStamp = new Date().toISOString();
	console.log(`[${timeStamp}] Ready! Logged in as ${readyClient.user.tag}`);
});

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter((file) => (file.endsWith('.ts') || file.endsWith('.js')) && !file.endsWith('.d.ts'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command: Command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand()) return;
	const command = client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		if (!fs.existsSync(logFile)) {
			fs.writeFileSync(logFile, '');
		}
		const timeStamp = new Date().toISOString();
		const logEntry = `[${timeStamp}] ${interaction.user.tag} executed command: /${interaction.commandName}\n`;
		fs.appendFileSync(logFile, logEntry);
		await command.execute(interaction);
		
	} catch (error) {
		const timeStamp = new Date().toISOString();
		fs.appendFileSync(logFile, `[${timeStamp}] Error executing command /${interaction.commandName}: ${error}\n`);
		console.error(error);
		try {
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({
					content: 'There was an error while executing this command!',
					flags: MessageFlags.Ephemeral,
				});
			} else {
				await interaction.reply({
					content: 'There was an error while executing this command!',
					flags: MessageFlags.Ephemeral,
				});
			}
		} catch (interactionError) {
			console.error('Error sending error message to user:', interactionError);
		}
	}
});

const dailyCleanupJob = new CronJob(
	'0 0 0 * * *', // seconds minutes hours dayOfMonth month dayOfWeek
	async () => {
		const timeStamp = new Date().toISOString();
		try {
			const affectedRows = await deleteOldPearls(30);
			console.log(`[${timeStamp}] Daily old pearl cleanup executed. Removed ${affectedRows} pearls.`);
		} catch (error) {
			console.error(`[${timeStamp}] Error during daily old pearl cleanup:`, error);
		}
	},
	null, // onComplete
	true, // start now
	'UTC'
);


const weeklyLeaderboardJob = new CronJob(
	'0 0 0 * * 0', // seconds minutes hours dayOfMonth month dayOfWeek (every Sunday at midnight UTC)
	async () => {
		const lastSunday = getSundayTimestamp(1);
		const leaderboard = await getAllPearlsUsersCount(lastSunday);
		const timeStamp = new Date().toISOString();
		console.log(`[${timeStamp}] Weekly leaderboard generated for week starting ${lastSunday.toISOString()}:`);
		client.channels.fetch(pearlChannelId).then(channel => {
			if (channel && channel.isTextBased()) {
				const textChannel = channel as TextChannel;
				const leaderboardString = leaderboard.map((user, index) => `${index + 1}. ${user.user} - ${user.user_count}`).join('\n') || 'No pearls collected last week.';
				const embed = new EmbedBuilder()
					.setColor(0x00aaff)
					.setTimestamp()
					.setTitle('Weekly Pearl Collection Leaderboard')
					.setDescription(leaderboardString);
				textChannel.send({ embeds: [embed] });
			} else {
				console.error(`[${timeStamp}] Channel not found or is not text-based.`);
			}
		});
	},
	null,
	true,
	'UTC'
);

client.login(token);

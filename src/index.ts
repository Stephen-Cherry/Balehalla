import fs from 'node:fs';
import path from 'node:path';
import { Client, Collection, Events, GatewayIntentBits, MessageFlags } from 'discord.js';
import { token } from './config.json';
import { Command } from './models/Command';
import { CustomClient } from './models/CustomClient';
import { CronJob } from 'cron';

const pearlsFile = path.join(process.cwd(), 'pearls.json');
const prevDaysFile = path.join(process.cwd(), 'pearls_yesterday.json');

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
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
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
	}
});

const _ = new CronJob(
	'0 0 0 * * *', // seconds minutes hours dayOfMonth month dayOfWeek
	async () => {
		if (!fs.existsSync(pearlsFile)) {
			return;
		}
		const prevDaysData = fs.readFileSync(pearlsFile, 'utf-8');
		fs.writeFileSync(`${prevDaysFile}`, prevDaysData);
		fs.writeFileSync(pearlsFile, JSON.stringify([], null, 2));
		const timeStamp = new Date().toISOString();
		console.log(`[${timeStamp}] Daily pearl reset executed.`);
	},
	null, // onComplete
	true, // start now
	'UTC'
);

client.login(token);

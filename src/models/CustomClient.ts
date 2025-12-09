import { Client, Collection } from "discord.js";
import { Command } from "./Command";

interface CustomClient extends Client {
	commands: Collection<string, Command>;
}

export { CustomClient };
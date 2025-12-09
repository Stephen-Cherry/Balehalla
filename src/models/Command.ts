import { Interaction } from "discord.js";

interface Command {
    data: { name: string; toJSON: () => unknown; };
    execute: (interaction: Interaction) => Promise<void>;
}

export { Command };

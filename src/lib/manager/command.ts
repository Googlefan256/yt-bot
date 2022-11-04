import {
  type ApplicationCommandOptionData,
  Collection,
  type ChatInputCommandInteraction,
} from "discord.js";
import type { Bot } from "../";
import commands from "../../commands";

export interface CommandOptions {
  exec(i: ChatInputCommandInteraction): Promise<any> | any;
  name: string;
  description: string;
  options?: ApplicationCommandOptionData[];
}

export class Command implements CommandOptions {
  exec: (i: ChatInputCommandInteraction) => Promise<any> | any;
  name: string;
  description: string;
  options?: ApplicationCommandOptionData[];
  constructor(options: CommandOptions) {
    this.exec = options.exec;
    this.name = options.name;
    this.description = options.description;
    this.options = options.options;
  }
  get raw() {
    return {
      name: this.name,
      description: this.description,
      options: this.options,
    };
  }
}

export class CommandManager extends Collection<string, Command> {
  constructor(public client: Bot) {
    super();
  }
  loadAll() {
    return commands.map((cmd) => {
      this.set(cmd.name, new Command(cmd));
    });
  }
}

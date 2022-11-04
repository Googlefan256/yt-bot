import { Client, User } from "discord.js";
import { VoiceManager, CommandManager, env, logger } from "./";

export class Bot extends Client {
  command: CommandManager;
  player: VoiceManager;
  owners: User[] = [];
  constructor() {
    super({
      intents: ["Guilds", "GuildIntegrations", "GuildVoiceStates"],
    });
    this.command = new CommandManager(this);
    this.player = new VoiceManager(this);
  }
  async start() {
    this.command.loadAll();
    await this.login(env.DiscordToken);
    this.owners = await new Promise((resolve) =>
      this.once("ready", () =>
        resolve(Promise.all(env.Owners.map((id) => this.users.fetch(id))))
      )
    );
    if (!this.application) return logger.panic("Application not found");
    this.application.commands.set(this.command.map((c) => c.raw));
    return null;
  }
}

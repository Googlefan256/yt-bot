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
    await this.application.commands.fetch();
    await Promise.all(
      this.command.map((c) => {
        const m = this.application?.commands.cache.find(
          (d) => d.name === c.raw.name && d.description === c.raw.description
        );
        if (m) return m.edit(c.raw);
        else return this.application?.commands.create(c.raw);
      })
    );
    return null;
  }
}

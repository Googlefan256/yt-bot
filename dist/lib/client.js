"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bot = void 0;
const discord_js_1 = require("discord.js");
const _1 = require("./");
class Bot extends discord_js_1.Client {
    command;
    player;
    owners = [];
    constructor() {
        super({
            intents: ["Guilds", "GuildIntegrations", "GuildVoiceStates"],
        });
        this.command = new _1.CommandManager(this);
        this.player = new _1.VoiceManager(this);
    }
    async start() {
        this.command.loadAll();
        await this.login(_1.env.DiscordToken);
        this.owners = await new Promise((resolve) => this.once("ready", () => resolve(Promise.all(_1.env.Owners.map((id) => this.users.fetch(id))))));
        if (!this.application)
            return _1.logger.panic("Application not found");
        this.application.commands.set(this.command.map((c) => c.raw));
        return null;
    }
}
exports.Bot = Bot;

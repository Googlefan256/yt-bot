import { Client, GatewayIntentBits, Options } from "discord.js";
import { env } from "./env";

export class Bot<T extends boolean> extends Client<T> {
    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.MessageContent,
            ],
            makeCache: Options.cacheWithLimits({
                MessageManager: 0,
                GuildMessageManager: 0,
            }),
            shards: "auto",
            allowedMentions: {
                parse: [],
                repliedUser: false,
            },
        });
    }
    async start() {
        await super.login(env.DiscordToken);
    }
}

export const bot: Bot<true> = new Bot();

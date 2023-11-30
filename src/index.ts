import { Events } from "discord.js";
import { bot } from "./client";
import { onMessage, onReady } from "./event";
import { error } from "./logger";

bot.once(Events.ClientReady, () => onReady(bot));
bot.on(Events.MessageCreate, async (message) => {
    if (!message.inGuild()) return;
    try {
        await onMessage(message);
    } catch (e) {
        error(e);
    }
});

(async () => {
    await bot.start();
})();

process.on("uncaughtException", (e) => {
    error(e);
});

process.on("unhandledRejection", (e) => {
    error(e);
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const lib_1 = require("./lib");
const bot = new lib_1.Bot();
bot.start();
bot.on("interactionCreate", async (i) => {
    if (i.isChatInputCommand()) {
        const cmd = bot.command.get(i.commandName);
        if (!cmd)
            return;
        try {
            await cmd.exec(i);
        }
        catch (error) {
            lib_1.logger.error(error);
            await i.reply("An error occured while executing this command.\nPlease try again later.");
        }
    }
});
bot.on("error", lib_1.logger.error);
bot.once("ready", () => {
    setInterval(() => {
        bot.user?.setActivity({
            name: "/help for help",
            type: discord_js_1.ActivityType.Streaming,
        });
        setTimeout(() => bot.user?.setActivity({
            name: `${bot.player.size}vc / Version ${lib_1.env.Version}`,
            type: discord_js_1.ActivityType.Streaming,
        }), 5000);
    }, 10000);
});
bot.once("ready", () => {
    lib_1.logger.info(`Logged in as ${bot.user?.tag}!`);
});
process.on("uncaughtException", lib_1.logger.error);
process.on("unhandledRejection", lib_1.logger.error);

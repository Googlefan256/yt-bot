import { ActivityType } from "discord.js";
import { Bot, env, logger, autoUpdate } from "./lib";
import { createServer } from "node:http";

autoUpdate(logger);

const bot = new Bot();
bot.start();

bot.on("interactionCreate", async (i) => {
  if (i.isChatInputCommand()) {
    const cmd = bot.command.get(i.commandName);
    if (!cmd) return;
    try {
      await cmd.exec(i);
    } catch (error) {
      logger.error(error);
      await i.reply(
        "An error occured while executing this command.\nPlease try again later."
      );
    }
  }
});

bot.on("error", logger.error);

bot.once("ready", () => {
  setInterval(() => {
    bot.user?.setActivity({
      name: "/help for help",
      type: ActivityType.Streaming,
    });
    setTimeout(
      () =>
        bot.user?.setActivity({
          name: `${bot.player.size}vc / Version ${env.Version}`,
          type: ActivityType.Streaming,
        }),
      5000
    );
  }, 10000);
  if (process.env.REPL_ID) {
    logger.info("Seems to be running on repl.it");
    logger.info("Starting web server...");
    createServer((_, res) => {
      res.writeHead(200);
      res.end("ok");
    });
    logger.info("Web server started");
  }
});

bot.once("ready", () => {
  logger.info(`Logged in as ${bot.user?.tag}!`);
});

process.on("uncaughtException", logger.error);

process.on("unhandledRejection", logger.error);

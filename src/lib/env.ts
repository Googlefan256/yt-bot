import { config } from "dotenv";
import { logger } from "./";
import { Colors } from "discord.js";
import { readFileSync } from "fs";

config();

if (!process.env.DISCORD_TOKEN) logger.panic("DISCORD_TOKEN is not defined");
const Owners = (process.env.OWNER_ID || "").split(",");

export const env = {
  Color:
    (process.env.COLOR || "Green") in Colors
      ? Colors[(process.env.COLOR || "Green") as keyof typeof Colors]
      : (() => {
          logger.warn("Invalid color, defaulting to Green");
          return Colors.Green;
        })(),
  DiscordToken: process.env.DISCORD_TOKEN as string,
  Owners,
  Version: JSON.parse(readFileSync("./package.json", "utf-8"))
    .version as string,
};

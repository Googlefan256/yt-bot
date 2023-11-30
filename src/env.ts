import type { Colors } from "discord.js";
import { panic } from "./logger";
import { config } from "dotenv";

interface Env {
    DiscordToken: string;
    OwnerId: string[];
    Color: keyof typeof Colors;
    Prefix: string;
}

function loadEnv(): Env {
    config();
    const DiscordToken = process.env.DISCORD_TOKEN!;
    if (!DiscordToken) panic("Discord token not found");
    const OwnerId = process.env.OWNER_ID?.split(",") ?? [];
    const Color = (process.env.COLOR ?? "Blue") as keyof typeof Colors;
    const Prefix = process.env.PREFIX || "!";
    return {
        DiscordToken,
        OwnerId,
        Color,
        Prefix,
    };
}

export const env = loadEnv();

import { EmbedBuilder, type EmbedData, Colors } from "discord.js";
import { env } from "./env";

export class Embed extends EmbedBuilder {
    constructor(data: Omit<EmbedData, "color">) {
        super({ ...data, color: Colors[env.Color] });
    }
}

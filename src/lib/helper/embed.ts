import { EmbedBuilder as BaseEmbedBuiler, EmbedData } from "discord.js";
import { env } from "../env";

export class EmbedBuilder extends BaseEmbedBuiler {
  constructor(arg: Partial<Omit<EmbedData, "color">> = {}) {
    super(
      Object.assign(arg, {
        color: env.Color,
        footer: { text: "yt-bot by Googlefan" },
      })
    );
  }
}

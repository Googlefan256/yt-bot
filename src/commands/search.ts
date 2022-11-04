import { SlashCommandStringOption } from "discord.js";
import { type CommandOptions, Embedlize } from "../lib";

export default {
  name: "search",
  description: "youtubeから音楽を検索します",
  options: [
    new SlashCommandStringOption()
      .setName("query")
      .setDescription("検索する文字列を指定します")
      .setRequired(true),
  ],
  async exec(i) {
    await i.deferReply();
    return i.editReply(await Embedlize(i.options.getString("query", true)));
  },
} as CommandOptions;

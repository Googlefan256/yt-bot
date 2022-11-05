import { SlashCommandIntegerOption } from "discord.js";
import { type Bot, type CommandOptions, EmbedBuilder } from "../lib";

export default {
  name: "volume",
  description: "音量を変更します",
  options: [
    new SlashCommandIntegerOption()
      .setName("音量")
      .setDescription("音量を指定します")
      .setRequired(false)
      .setMaxValue(200)
      .setMinValue(0),
  ],
  async exec(i) {
    const player = await (i.client as Bot).player.getPlayer(i);
    if (!player) return;
    const volume = i.options.getInteger("音量");
    if (!volume) {
      return i.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("情報")
            .setDescription(`現在の音量は${player.volume * 500}です`),
        ],
      });
    }
    player.setVolume(volume / 500);
    return i.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("情報")
          .setDescription(`音量を${volume}に変更しました。`),
      ],
    });
  },
} as CommandOptions;

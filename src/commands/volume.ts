import { SlashCommandNumberOption } from "discord.js";
import { type Bot, type CommandOptions, EmbedBuilder } from "../lib";

export default {
  name: "volume",
  description: "音量を変更します",
  options: [
    new SlashCommandNumberOption()
      .setName("音量")
      .setDescription("音量を指定します")
      .setRequired(true)
      .setMaxValue(2)
      .setMinValue(0),
  ],
  async exec(i) {
    const player = await (i.client as Bot).player.getPlayer(i);
    if (!player) return;
    const volume = i.options.getNumber("音量", true);
    player.setVolume(volume);
    return i.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("情報")
          .setDescription(`音量を${volume}に変更しました。`),
      ],
    });
  },
} as CommandOptions;

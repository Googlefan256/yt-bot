import { SlashCommandIntegerOption } from "discord.js";
import { Bot, CommandOptions, EmbedBuilder } from "../lib";

export default {
  name: "delete",
  description: "キューから指定した曲を削除します",
  options: [
    new SlashCommandIntegerOption()
      .setName("曲")
      .setDescription("削除するトラックを指定します")
      .setRequired(true),
  ],
  async exec(i) {
    const player = await (i.client as Bot).player.getPlayer(i);
    if (!player) return;
    const index = i.options.getInteger("曲", true);
    if (index > player.tracks.length || index < 1) {
      return i.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("エラー")
            .setDescription("指定された曲は存在しません。"),
        ],
        ephemeral: true,
      });
    } else {
      player.tracks = player.tracks.filter((_, i) => i !== index);
      return i.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("情報")
            .setDescription(`キューから${index}番目の曲を削除しました。`),
        ],
      });
    }
  },
} as CommandOptions;

import { Bot, CommandOptions, EmbedBuilder } from "../lib";

export default {
  name: "shuffle",
  description: "シャッフルします",
  async exec(i) {
    const player = await (i.client as Bot).player.getPlayer(i);
    if (!player) return;
    player.shuffle();
    return i.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("情報")
          .setDescription("シャッフルしました"),
      ],
    });
  },
} as CommandOptions;

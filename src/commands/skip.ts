import { type Bot, type CommandOptions, EmbedBuilder } from "../lib";

export default {
  name: "skip",
  description: "現在再生中の音楽をスキップします",
  async exec(i) {
    const player = await (i.client as Bot).player.getPlayer(i);
    if (!player) return;
    await player.skip();
    return i.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("情報")
          .setDescription("スキップしました。"),
      ],
    });
  },
} as CommandOptions;

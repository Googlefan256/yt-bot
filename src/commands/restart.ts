import { EmbedBuilder, env, type CommandOptions } from "../lib";
import { Updater } from "../lib";

export default {
  name: "restart",
  description: "botを再起動します",
  async exec(i) {
    if (!env.Owners.includes(i.user.id))
      return i.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("エラー")
            .setDescription("このコマンドは開発者のみが実行できます"),
        ],
      });
    const updater = new Updater();
    await i.reply({
      embeds: [
        new EmbedBuilder().setTitle("情報").setDescription("再起動します"),
      ],
    });
    updater.restart();
  },
} as CommandOptions;

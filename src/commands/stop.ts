import { EmbedBuilder, env, type CommandOptions } from "../lib";
import { Updater } from "../lib";

export default {
  name: "stop",
  description: "botを停止します",
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
        new EmbedBuilder().setTitle("情報").setDescription("停止します"),
      ],
    });
    updater.exit();
  },
} as CommandOptions;

import { type CommandOptions, env, EmbedBuilder, Updater } from "../lib";

export default {
  name: "update",
  description: "botのアップデートを行います",
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
    const status = updater.pull();
    if (!status) {
      return i.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("エラー")
            .setDescription("すでに最新です"),
        ],
      });
    } else {
      await i.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("情報")
            .setDescription(
              "アップデートを開始します\n依存関係をインストールします"
            ),
        ],
      });
      updater.install();
      await i.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("情報")
            .setDescription(
              "アップデートを開始します\n依存関係をインストールします\n依存関係のインストールが完了しました\nスクリプトをビルドします"
            ),
        ],
      });
      updater.build();
      await i.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("情報")
            .setDescription(
              "アップデートを開始します\n依存関係をインストールします\n依存関係のインストールが完了しました\nスクリプトをビルドします\nスクリプトのビルドが完了しました\n再起動します"
            ),
        ],
      });
      updater.restart();
    }
  },
} as CommandOptions;

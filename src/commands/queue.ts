import { type Bot, type CommandOptions, EmbedBuilder } from "../lib";
import { PlayerLoopState } from "../lib/manager/voice";

export default {
  name: "q",
  description: "キューを表示します",
  async exec(i) {
    const player = await (i.client as Bot).player.getPlayer(i);
    if (!player) return;
    if (!i.guild) return;
    return i.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: i.guild.name,
            iconURL: i.guild.iconURL() || undefined,
          })
          .addFields({
            name: "現在再生中",
            value: player.current
              ? `[${player.current.title}](${player.current.url})\n> \`${
                  i.client.users.resolve(player.current.requester)?.tag || ""
                }\``
              : "現在再生中の曲はありません",
          })
          .setThumbnail(player.current?.thumbnail || null)
          .setFooter({
            text: `${
              player.loopstate === PlayerLoopState.Current
                ? "ループは有効です"
                : player.loopstate === PlayerLoopState.Track
                ? "トラックループは有効です"
                : "ループは無効です"
            } | 音量は${player.volume}に設定されています`,
          })
          .addFields(
            ...player.tracks.slice(0, 24).map(
              (v, index) =>
                [
                  {
                    name: `${index + 1}番目`,
                    value: `[${v.title}](${v.url})\n> \`${
                      i.client.users.resolve(v.requester)?.tag || ""
                    }\``,
                  },
                ][0]
            )
          ),
      ],
    });
  },
} as CommandOptions;

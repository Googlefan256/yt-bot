import { Bot, CommandOptions, EmbedBuilder } from "../lib";

export default {
  name: "np",
  description: "現在再生中の曲を表示します",
  async exec(i) {
    const player = await (i.client as Bot).player.getPlayer(i);
    if (!player) return;
    const track = player.current;
    if (!track)
      return i.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("エラー")
            .setDescription("現在再生中の曲はありません。"),
        ],
      });
    return i.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("情報 - " + track.title)
          .setDescription(track.description)
          .setAuthor({
            name: track.author.name,
            url: track.author.url,
          })
          .setThumbnail(track.thumbnail)
          .setURL(track.url)
          .setFooter({
            text: `再生中です | ${
              i.client.users.resolve(track.requester)?.tag
            }`,
          }),
      ],
    });
  },
} as CommandOptions;

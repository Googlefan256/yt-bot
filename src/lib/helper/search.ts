import { ActionRowBuilder, type ButtonBuilder } from "discord.js";
import { LinkButtonBuilder, EmbedBuilder } from "./";
import { search as yts } from "yt-search";
import ytdl from "ytdl-core";

export const search = (q: string) =>
  yts(q)
    .then((v) => v.videos.slice(0, 5))
    .catch(() => []);

export const Embedlize = (q: string) =>
  search(q).then((results) => {
    if (!results.length)
      return {
        embeds: [
          new EmbedBuilder()
            .setTitle("エラー")
            .setDescription(
              "検索結果が見つかりませんでした...\n検索語句を変えて再検索してみてください\n(検索の過度な実行による制限の可能性もあります)"
            ),
        ],
      };
    return {
      embeds: [
        new EmbedBuilder()
          .setTitle("YouTubeの検索結果")
          .setDescription(
            results
              .map(
                (result) =>
                  `[${result.title}](${
                    result.url
                  })\n> ${result.description.replace(/\n/g, "\n> ")}\n[${
                    result.author.name
                  }](${result.author.url})`
              )
              .join("\n\n")
          )
          .setThumbnail(results[0].thumbnail),
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new LinkButtonBuilder()
            .setURL(
              `https://www.youtube.com/results?search_query=${encodeURIComponent(
                q
              )}`
            )
            .setLabel("もっと見る")
            .setEmoji("🔎")
        ),
      ],
    };
  });

export const resolveId = (q: string) => {
  try {
    return ytdl.getVideoID(q);
  } catch {
    return null;
  }
};

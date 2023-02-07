import { SlashCommandStringOption, TextChannel, VoiceChannel } from "discord.js";
import { Bot, EmbedBuilder, searchPlaylist, search, Voice, type CommandOptions } from "../lib";
import { search as yts } from "yt-search";

export default {
  name: "playlist",
  description: "playlistから再生します",
  options: [
    new SlashCommandStringOption()
      .setName("曲")
      .setDescription("再生する曲のURLまたはキーワード")
      .setRequired(true),
  ],
  async exec(i) {
    let player = i.guildId
      ? (i.client as Bot).player.get(i.guildId)
      : undefined;
    if (!i.guild?.voiceStates.cache.get(i.user.id)?.channelId) {
      return i.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("エラー")
            .setDescription("ボイスチャンネルに接続してください。"),
        ],
        ephemeral: true,
      });
    }
    if (
      player &&
      player.vchannel.id !==
        i.guild?.voiceStates.cache.get(i.user.id)?.channelId
    ) {
      await i.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("エラー")
            .setDescription("同じボイスチャンネルに接続してください。"),
        ],
        ephemeral: true,
      });
      return null;
    }
    if (!player) {
      player = new Voice(
        i.client as Bot,
        i.guild?.voiceStates.cache.get(i.user.id)?.channel as VoiceChannel,
        i.channel as TextChannel
      );
    }
    const query = i.options.getString("曲", true);
    const r = (await searchPlaylist(query))[0];
    if (!r) {
      return i.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("エラー")
            .setDescription("曲が見つかりませんでした。"),
        ],
        ephemeral: true,
      });
    }
    const res = Object.assign(await yts({
        listId: r.listId,
    }), {
      requester: i.user.id,
    });
    if (!res) {
      return i.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("エラー")
            .setDescription("リストが見つかりませんでした。"),
        ],
        ephemeral: true,
      });
    }
    player.addList(res, i);
  },
} as CommandOptions;

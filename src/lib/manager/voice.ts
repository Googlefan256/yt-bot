import {
  Collection,
  type Snowflake,
  type VoiceChannel,
  type TextChannel,
  type ChatInputCommandInteraction,
  ActionRowBuilder,
  type ButtonBuilder,
} from "discord.js";
import { Bot, EmbedBuilder, LinkButtonBuilder } from "../";
import EventEmitter from "node:events";
import {
  type AudioPlayer,
  createAudioPlayer,
  joinVoiceChannel,
  VoiceConnection,
  VoiceConnectionStatus,
  createAudioResource,
  StreamType,
  AudioResource,
  AudioPlayerStatus,
  entersState,
} from "@discordjs/voice";
import ytdl from "ytdl-core";
import { VideoSearchResult } from "yt-search";

export enum PlayerLoopState {
  None,
  Current,
  Track,
}

export enum PlayerDestroyReason {
  Empty,
  Disconnected,
  Stopped,
}

export interface Video extends VideoSearchResult {
  requester: Snowflake;
}

export class Voice extends EventEmitter {
  loopstate = PlayerLoopState.None;
  volume = 1;
  player: AudioPlayer;
  tracks: Array<Video>;
  guildId: Snowflake;
  connection: VoiceConnection;
  current?: Video;
  constructor(
    public client: Bot,
    public vchannel: VoiceChannel,
    public tchannel: TextChannel
  ) {
    super();
    this.tracks = [];
    this.player = createAudioPlayer();
    this.vchannel = vchannel;
    this.guildId = vchannel.guildId;
    this.vchannel = vchannel;
    this.client.player.set(vchannel.guildId, this);
    this.connection = joinVoiceChannel({
      channelId: vchannel.id,
      guildId: vchannel.guildId,
      adapterCreator: vchannel.guild.voiceAdapterCreator,
    });
    this.connection.subscribe(this.player);

    this.connection.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        await Promise.race([
          entersState(this.connection, VoiceConnectionStatus.Signalling, 5_000),
          entersState(this.connection, VoiceConnectionStatus.Connecting, 5_000),
        ]);
      } catch (error) {
        this.destroy(PlayerDestroyReason.Disconnected);
      }
    });
  }
  onPlaying(video: Video, i?: ChatInputCommandInteraction) {
    if (this.loopstate !== PlayerLoopState.Current) {
      const payload = {
        embeds: [
          new EmbedBuilder()
            .setTitle("再生中")
            .setDescription(
              `**[${video.title}](${video.url})**\n${video.author.name}`
            )
            .setThumbnail(video.thumbnail)
            .setFooter({ text: `再生時間: ${video.timestamp}` }),
        ],
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new LinkButtonBuilder()
              .setLabel("YouTube")
              .setURL(video.url)
              .setEmoji("🔗")
          ),
        ],
      };
      return i?.reply ? i.reply(payload) : this.tchannel.send(payload);
    }
  }
  onQueueAdd(video: Video, i?: ChatInputCommandInteraction) {
    const payload = {
      embeds: [
        new EmbedBuilder()
          .setTitle("キューに追加しました")
          .setDescription(
            `**[${video.title}](${video.url})**\n${video.author.name}`
          )
          .setThumbnail(video.thumbnail)
          .setFooter({ text: `再生時間: ${video.timestamp}` }),
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new LinkButtonBuilder()
            .setLabel("YouTube")
            .setURL(video.url)
            .setEmoji("🔗")
        ),
      ],
    };
    return i?.reply ? i.reply(payload) : this.tchannel.send(payload);
  }
  onDisconnect(i?: ChatInputCommandInteraction) {
    const payload = {
      embeds: [
        new EmbedBuilder()
          .setTitle("エラー")
          .setDescription("切断されたため再生を終了します。"),
      ],
    };
    return i?.reply ? i.reply(payload) : this.tchannel.send(payload);
  }
  onEmpty(i?: ChatInputCommandInteraction) {
    const payload = {
      embeds: [
        new EmbedBuilder()
          .setTitle("情報")
          .setDescription("キューが空になったため再生を終了します。"),
      ],
    };
    return i?.reply ? i.reply(payload) : this.tchannel.send(payload);
  }
  onStop(i?: ChatInputCommandInteraction) {
    const payload = {
      embeds: [
        new EmbedBuilder()
          .setTitle("情報")
          .setDescription("正常に切断しました。"),
      ],
    };
    return i?.reply ? i.reply(payload) : this.tchannel.send(payload);
  }
  private async stream(id: string) {
    const stream = ytdl(id, {
      filter: (format) =>
        format.audioCodec === "opus" && format.container === "webm",
      highWaterMark: 32 * 32 * 32 * 32 * 32,
    });
    this.playResource(
      createAudioResource(stream, {
        inputType: StreamType.WebmOpus,
        inlineVolume: true,
      })
    );
  }
  private async playResource(resource: AudioResource) {
    try {
      return this.player.play(resource);
    } catch {
      return new Promise((resolve) => {
        setTimeout(() => resolve(this.playResource(resource)), 2000);
      });
    }
  }
  async add(video: Video, i?: ChatInputCommandInteraction) {
    if (this.player.state.status === AudioPlayerStatus.Idle) {
      this.current = video;
      this.play(video);
      return this.onPlaying(video, i);
    } else {
      this.tracks.push(video);
      return this.onQueueAdd(video, i);
    }
  }
  async play(video: Video) {
    this.stream(video.videoId);
    this.player.once(AudioPlayerStatus.Idle, () => {
      this.current = undefined;
      if (this.loopstate === PlayerLoopState.Current)
        this.tracks.unshift(video);
      else if (this.loopstate === PlayerLoopState.Track)
        this.tracks.push(video);
      const next = this.tracks.shift();
      if (!next) {
        return this.destroy(PlayerDestroyReason.Empty);
      }
      this.current = next;
      this.onPlaying(next);
      return this.play(next);
    });
  }
  async destroy(reason: PlayerDestroyReason, i?: ChatInputCommandInteraction) {
    this.client.player.delete(this.guildId);
    this.player.stop();
    this.connection.destroy();
    if (reason === PlayerDestroyReason.Disconnected) {
      return this.onDisconnect(i);
    } else if (reason === PlayerDestroyReason.Empty) {
      return this.onEmpty(i);
    } else {
      return this.onStop(i);
    }
  }
  skip() {
    if (!this.current) return;
    this.player.stop();
    if (this.loopstate === PlayerLoopState.Current)
      this.tracks.unshift(this.current);
    else if (this.loopstate === PlayerLoopState.Track)
      this.tracks.push(this.current);
    this.current = undefined;
    const next = this.tracks.shift();
    if (!next) {
      return this.destroy(PlayerDestroyReason.Empty);
    }
    return this.play(next);
  }
  setVolume(volume: number) {
    this.volume = volume;
    if (this.player.state.status === AudioPlayerStatus.Playing) {
      this.player.state.resource.volume?.setVolume(volume);
    }
  }
  shuffle() {
    this.tracks = this.tracks.sort(() => Math.random() / 2);
  }
  pause(i: ChatInputCommandInteraction) {
    if (this.player.pause()) {
      return i.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("情報")
            .setDescription("一時停止しました。"),
        ],
      });
    } else {
      return i.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("エラー")
            .setDescription("一時停止に失敗しました。"),
        ],
      });
    }
  }
  resume(i: ChatInputCommandInteraction) {
    if (this.player.unpause()) {
      return i.reply({
        embeds: [
          new EmbedBuilder().setTitle("情報").setDescription("再開しました。"),
        ],
      });
    } else {
      return i.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("エラー")
            .setDescription("再開に失敗しました。"),
        ],
      });
    }
  }
}

export class VoiceManager extends Collection<string, Voice> {
  constructor(public client: Bot) {
    super();
  }
  async getPlayer(i: ChatInputCommandInteraction) {
    const player = i.guildId ? this.get(i.guildId) : undefined;
    if (!player) {
      await i.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("エラー")
            .setDescription("このサーバーでは音楽が再生されていません。"),
        ],
        ephemeral: true,
      });
      return null;
    }
    if (
      player.vchannel.id !==
      i.guild?.voiceStates.cache.get(i.user.id)?.channelId
    ) {
      await i.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("エラー")
            .setDescription("ボイスチャンネルに接続していません。"),
        ],
        ephemeral: true,
      });
      return null;
    }
    return player;
  }
}

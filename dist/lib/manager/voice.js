"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceManager = exports.Voice = exports.PlayerDestroyReason = exports.PlayerLoopState = void 0;
const discord_js_1 = require("discord.js");
const __1 = require("../");
const node_events_1 = __importDefault(require("node:events"));
const voice_1 = require("@discordjs/voice");
const ytdl_core_1 = __importDefault(require("ytdl-core"));
var PlayerLoopState;
(function (PlayerLoopState) {
    PlayerLoopState[PlayerLoopState["None"] = 0] = "None";
    PlayerLoopState[PlayerLoopState["Current"] = 1] = "Current";
    PlayerLoopState[PlayerLoopState["Track"] = 2] = "Track";
})(PlayerLoopState = exports.PlayerLoopState || (exports.PlayerLoopState = {}));
var PlayerDestroyReason;
(function (PlayerDestroyReason) {
    PlayerDestroyReason[PlayerDestroyReason["Empty"] = 0] = "Empty";
    PlayerDestroyReason[PlayerDestroyReason["Disconnected"] = 1] = "Disconnected";
    PlayerDestroyReason[PlayerDestroyReason["Stopped"] = 2] = "Stopped";
})(PlayerDestroyReason = exports.PlayerDestroyReason || (exports.PlayerDestroyReason = {}));
class Voice extends node_events_1.default {
    client;
    vchannel;
    tchannel;
    loopstate = PlayerLoopState.None;
    volume = 1;
    player;
    tracks;
    guildId;
    connection;
    current;
    constructor(client, vchannel, tchannel) {
        super();
        this.client = client;
        this.vchannel = vchannel;
        this.tchannel = tchannel;
        this.tracks = [];
        this.player = (0, voice_1.createAudioPlayer)();
        this.vchannel = vchannel;
        this.guildId = vchannel.guildId;
        this.vchannel = vchannel;
        this.client.player.set(vchannel.guildId, this);
        this.connection = (0, voice_1.joinVoiceChannel)({
            channelId: vchannel.id,
            guildId: vchannel.guildId,
            adapterCreator: vchannel.guild.voiceAdapterCreator,
        });
        this.connection.subscribe(this.player);
        this.connection.on(voice_1.VoiceConnectionStatus.Disconnected, async () => {
            try {
                await Promise.race([
                    (0, voice_1.entersState)(this.connection, voice_1.VoiceConnectionStatus.Signalling, 5000),
                    (0, voice_1.entersState)(this.connection, voice_1.VoiceConnectionStatus.Connecting, 5000),
                ]);
            }
            catch (error) {
                this.destroy(PlayerDestroyReason.Disconnected);
            }
        });
    }
    onPlaying(video, i) {
        if (this.loopstate !== PlayerLoopState.Current) {
            const payload = {
                embeds: [
                    new __1.EmbedBuilder()
                        .setTitle("再生中")
                        .setDescription(`**[${video.title}](${video.url})**\n${video.author.name}`)
                        .setThumbnail(video.thumbnail)
                        .setFooter({ text: `再生時間: ${video.timestamp}` }),
                ],
            };
            return i?.reply ? i.reply(payload) : this.tchannel.send(payload);
        }
    }
    onQueueAdd(video, i) {
        const payload = {
            embeds: [
                new __1.EmbedBuilder()
                    .setTitle("キューに追加しました")
                    .setDescription(`**[${video.title}](${video.url})**\n${video.author.name}`)
                    .setThumbnail(video.thumbnail)
                    .setFooter({ text: `再生時間: ${video.timestamp}` }),
            ],
        };
        return i?.reply ? i.reply(payload) : this.tchannel.send(payload);
    }
    onDisconnect(i) {
        const payload = {
            embeds: [
                new __1.EmbedBuilder()
                    .setTitle("エラー")
                    .setDescription("切断されたため再生を終了します。"),
            ],
        };
        return i?.reply ? i.reply(payload) : this.tchannel.send(payload);
    }
    onEmpty(i) {
        const payload = {
            embeds: [
                new __1.EmbedBuilder()
                    .setTitle("情報")
                    .setDescription("キューが空になったため再生を終了します。"),
            ],
        };
        return i?.reply ? i.reply(payload) : this.tchannel.send(payload);
    }
    onStop(i) {
        const payload = {
            embeds: [
                new __1.EmbedBuilder()
                    .setTitle("情報")
                    .setDescription("正常に切断しました。"),
            ],
        };
        return i?.reply ? i.reply(payload) : this.tchannel.send(payload);
    }
    async stream(id) {
        const stream = (0, ytdl_core_1.default)(id, {
            filter: (format) => format.audioCodec === "opus" && format.container === "webm",
            quality: "highest",
            highWaterMark: 32 * 32 * 32 * 32 * 32,
        });
        this.playResource((0, voice_1.createAudioResource)(stream, {
            inputType: voice_1.StreamType.WebmOpus,
            inlineVolume: true,
        }));
    }
    async playResource(resource) {
        try {
            return this.player.play(resource);
        }
        catch {
            return new Promise((resolve) => {
                setTimeout(() => resolve(this.playResource(resource)), 2000);
            });
        }
    }
    async add(video, i) {
        if (this.player.state.status === voice_1.AudioPlayerStatus.Idle) {
            this.current = video;
            this.play(video);
            return this.onPlaying(video, i);
        }
        else {
            this.tracks.push(video);
            return this.onQueueAdd(video, i);
        }
    }
    async play(video) {
        this.stream(video.videoId);
        this.player.once(voice_1.AudioPlayerStatus.Idle, () => {
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
    async destroy(reason, i) {
        this.client.player.delete(this.guildId);
        this.player.stop();
        this.connection.destroy();
        if (reason === PlayerDestroyReason.Disconnected) {
            return this.onDisconnect(i);
        }
        else if (reason === PlayerDestroyReason.Empty) {
            return this.onEmpty(i);
        }
        else {
            return this.onStop(i);
        }
    }
    skip() {
        if (!this.current)
            return;
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
        return this.add(next);
    }
    setVolume(volume) {
        this.volume = volume;
        if (this.player.state.status === voice_1.AudioPlayerStatus.Playing) {
            this.player.state.resource.volume?.setVolume(volume);
        }
    }
    shuffle() {
        this.tracks = this.tracks.sort(() => Math.random() / 2);
    }
    pause(i) {
        if (this.player.pause()) {
            return i.reply({
                embeds: [
                    new __1.EmbedBuilder()
                        .setTitle("情報")
                        .setDescription("一時停止しました。"),
                ],
            });
        }
        else {
            return i.reply({
                embeds: [
                    new __1.EmbedBuilder()
                        .setTitle("エラー")
                        .setDescription("一時停止に失敗しました。"),
                ],
            });
        }
    }
    resume(i) {
        if (this.player.unpause()) {
            return i.reply({
                embeds: [
                    new __1.EmbedBuilder().setTitle("情報").setDescription("再開しました。"),
                ],
            });
        }
        else {
            return i.reply({
                embeds: [
                    new __1.EmbedBuilder()
                        .setTitle("エラー")
                        .setDescription("再開に失敗しました。"),
                ],
            });
        }
    }
}
exports.Voice = Voice;
class VoiceManager extends discord_js_1.Collection {
    client;
    constructor(client) {
        super();
        this.client = client;
    }
    async getPlayer(i) {
        const player = i.guildId ? this.get(i.guildId) : undefined;
        if (!player) {
            await i.reply({
                embeds: [
                    new __1.EmbedBuilder()
                        .setTitle("エラー")
                        .setDescription("このサーバーでは音楽が再生されていません。"),
                ],
                ephemeral: true,
            });
            return null;
        }
        if (player.vchannel.id !==
            i.guild?.voiceStates.cache.get(i.user.id)?.channelId) {
            await i.reply({
                embeds: [
                    new __1.EmbedBuilder()
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
exports.VoiceManager = VoiceManager;

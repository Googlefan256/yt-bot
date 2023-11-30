import {
    joinVoiceChannel,
    getVoiceConnection,
    AudioPlayer,
    AudioPlayerState,
} from "@discordjs/voice";
import { Collection, GuildChannel, GuildTextBasedChannel } from "discord.js";
import { Video, dl } from "./yt";
import { info } from "./logger";

export class Player {
    private playing = false;
    public looping = false;
    public queuelooping = false;
    constructor(
        public player: AudioPlayer,
        public queue: Video[] = [],
        public channel: GuildTextBasedChannel,
    ) {}
    async push(options: Video) {
        this.queue.push(options);
        if (!this.playing) {
            this.playing = true;
            await this.channel.send(`再生します。`);
            this.play();
        } else {
            await this.channel.send(
                `キューに追加しました。(${this.queue.length}曲目)`,
            );
        }
    }
    async skip() {
        this.player.stop();
        await this.channel.send("スキップしました。");
    }
    async pause() {
        this.player.pause();
        await this.channel.send("一時停止しました。");
    }
    async resume() {
        this.player.unpause();
        await this.channel.send("再開しました。");
    }
    async clear() {
        this.queue = [];
        this.player.stop();
        await this.channel.send("停止しました。");
    }
    async play() {
        if (!this.queue.length) {
            this.playing = false;
            return;
        }
        const options =
            this.looping && !this.queuelooping
                ? this.queue[0]
                : this.queue.shift()!;
        try {
            await this.channel.send(
                `再生します。(${
                    this.looping && !this.queuelooping
                        ? this.queue.length
                        : this.queue.length + 1
                }曲残っています。)`,
            );
            const stream = dl(options);
            this.player.play(stream);
            const listener = (
                state: AudioPlayerState,
                newState: AudioPlayerState,
            ) => {
                if (state.status === "playing" && newState.status === "idle") {
                    info(`Finished playing ${options.title}.`);
                    this.player.off("stateChange", listener);
                    if (this.queuelooping) {
                        this.queue.push(options);
                    }
                    this.play();
                }
            };
            this.player.on("stateChange", listener);
        } catch (e) {
            console.error(e);
            this.play();
        }
    }
}

const players = new Collection<string, Player>();

export async function connect(
    channel: GuildChannel,
    log: GuildTextBasedChannel,
) {
    const conn = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
        selfDeaf: true,
    });
    const player = new AudioPlayer();
    conn.subscribe(player);
    players.set(channel.guild.id, new Player(player, [], log));
    return conn;
}

export function get(guildId: string) {
    const conn = getVoiceConnection(guildId);
    if (!conn) {
        if (players.has(guildId)) players.delete(guildId);
        return {};
    }
    return {
        player: players.get(guildId),
        conn,
    };
}

export function disconnect(guildId: string) {
    const conn = getVoiceConnection(guildId);
    if (conn) conn.destroy();
}

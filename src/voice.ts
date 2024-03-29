import {
    joinVoiceChannel,
    getVoiceConnection,
    AudioPlayer,
    AudioPlayerState,
} from "@discordjs/voice";
import {
    Collection,
    GuildChannel,
    GuildTextBasedChannel,
    escapeInlineCode,
} from "discord.js";
import { Video, dl } from "./yt";
import { error, info } from "./logger";
function shuffle<T>(arr: T[]) {
    arr = arr.slice();
    let i = arr.length;
    let j = 0;
    let temp: T;
    if (i === 0) {
        return arr;
    }
    while (--i) {
        j = Math.floor(Math.random() * (i + 1));
        temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    return arr;
}

export class Player {
    private playing = false;
    public looping = false;
    public queuelooping = false;
    constructor(
        public player: AudioPlayer,
        public queue: Video[] = [],
        public channel: GuildTextBasedChannel,
    ) {}
    async push(options: Video, playlist: boolean = false) {
        this.queue.push(options);
        if (!this.playing) {
            this.playing = true;
            await this.channel.send(
                `[${options.title}](<https://youtube.com/watch?v=${options.id}>)を再生します。`,
            );
            this.play();
        } else {
            if (playlist) return;
            await this.channel.send(
                `[${options.title}](<https://youtube.com/watch?v=${options.id}>)をキューに追加しました。(${this.queue.length}曲目)`,
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
    async shuffle() {
        this.queue = shuffle(this.queue);
        await this.channel.send("シャッフルしました。");
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
                `${escapeInlineCode(options.title)}を再生します。(${
                    this.looping ?? this.queuelooping
                        ? "ループ中"
                        : `${this.queue.length}曲残っています`
                })`,
            );
            const stream = await dl(options.id);
            this.player.play(stream);
            const onError = (e: any) => {
                error(e);
                this.player.off("stateChange", listener);
                this.player.off("error", onError);
                this.play();
            };
            const listener = (
                state: AudioPlayerState,
                newState: AudioPlayerState,
            ) => {
                if (state.status === "playing" && newState.status === "idle") {
                    info(`Finished playing ${options.title}.`);
                    this.player.off("stateChange", listener);
                    this.player.off("error", onError);
                    if (this.queuelooping) {
                        this.queue.push(options);
                    }
                    this.play();
                }
            };
            this.player.on("stateChange", listener);
            this.player.on("error", onError);
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

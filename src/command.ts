import { GuildTextBasedChannel, Message } from "discord.js";
import { fetchPlaylist, ys } from "./yt";
import { connect, disconnect, get } from "./voice";
import { Embed } from "./embed";

type Command = {
    name: string;
    alias: string[];
    run: (message: Message<true>, args: string[]) => void | Promise<void>;
};

export const commands: Command[] = [
    {
        name: "ping",
        alias: [],
        run: ping,
    },
    {
        name: "play",
        alias: [],
        run: play,
    },
    {
        name: "playlist",
        alias: ["pl"],
        run: playlist,
    },
    {
        name: "join",
        alias: [],
        run: join,
    },
    {
        name: "skip",
        alias: ["s"],
        run: skip,
    },
    {
        name: "pause",
        alias: [],
        run: pause,
    },
    {
        name: "resume",
        alias: [],
        run: resume,
    },
    {
        name: "stop",
        alias: [],
        run: stop,
    },
    {
        name: "loop",
        alias: [],
        run: loop,
    },
    {
        name: "queueloop",
        alias: [],
        run: queueloop,
    },
    {
        name: "help",
        alias: ["h"],
        run: help,
    },
    {
        name: "stop",
        alias: ["clear"],
        run: stop,
    },
    {
        name: "dc",
        alias: ["disconnect"],
        run: dc,
    },
    {
        name: "queue",
        alias: ["q"],
        run: queue,
    },
];

async function queue(message: Message<true>, args: string[]) {
    if (!message.member?.voice.channelId) {
        return;
    }
    const { player } = get(message.guildId!);
    if (!player) return;
    if (!player.queue.length) {
        await message.reply("キューは空です。");
        return;
    }
    const desc = player.queue.map((q, i) => {
        return {
            name: q.title,
            value: `${q.description}[Source](https://youtube.com/watch?v=${q.id})`,
        };
    });
    await message.reply({
        embeds: [
            new Embed({
                title: "キュー",
                fields: desc,
                footer: {
                    text: `ループ: ${
                        player.looping ? "有効" : "無効"
                    } キューループ: ${player.queuelooping ? "有効" : "無効"}`,
                },
            }),
        ],
    });
}

async function join(message: Message, args: string[]) {
    if (!message.member?.voice.channel) return;
    const channel = message.member.voice.channel;
    const _conn = connect(channel, message.channel as GuildTextBasedChannel);
    await message.reply(`${channel.toString()}へ接続しました。`);
}

async function dc(message: Message<true>, args: string[]) {
    if (!message.member?.voice.channelId) {
        return;
    }
    disconnect(message.guildId!);
}

async function ping(message: Message<true>, args: string[]) {
    let now = Date.now();
    const msg = await message.reply("計測中です...");
    now = Date.now() - now;
    await msg.edit(
        `Websocket:\`${message.client.ws.ping}\`ms\nRest:\`${now}\`ms`,
    );
}

async function skip(message: Message<true>, args: string[]) {
    if (!message.member?.voice.channelId) {
        return;
    }
    const { player } = get(message.guildId!);
    if (!player) return;
    player.skip();
}

async function pause(message: Message<true>, args: string[]) {
    if (!message.member?.voice.channelId) {
        return;
    }
    const { player } = get(message.guildId!);
    if (!player) return;
    player.pause();
}

async function resume(message: Message<true>, args: string[]) {
    if (!message.member?.voice.channelId) {
        return;
    }
    const { player } = get(message.guildId!);
    if (!player) return;
    player.resume();
}

async function stop(message: Message<true>, args: string[]) {
    if (!message.member?.voice.channelId) {
        return;
    }
    const { player } = get(message.guildId!);
    if (!player) return;
    player.clear();
}

async function loop(message: Message<true>, args: string[]) {
    if (!message.member?.voice.channelId) {
        return;
    }
    const { player } = get(message.guildId!);
    if (!player) return;
    player.looping = !player.looping;
    await message.reply(
        `ループを${player.looping ? "有効" : "無効"}にしました。`,
    );
}

async function queueloop(message: Message<true>, args: string[]) {
    if (!message.member?.voice.channelId) {
        return;
    }
    const { player } = get(message.guildId!);
    if (!player) return;
    player.queuelooping = !player.queuelooping;
    await message.reply(
        `キューループを${player.queuelooping ? "有効" : "無効"}にしました。`,
    );
}

async function help(message: Message<true>, args: string[]) {
    await message.reply({
        embeds: [
            new Embed({
                title: "ヘルプ",
                description: "コマンド一覧",
                fields: [
                    {
                        name: "ping",
                        value: "pingを送信します。",
                    },
                    {
                        name: "play",
                        value: "音楽を再生します。",
                    },
                    {
                        name: "playlist",
                        value: "プレイリストを再生します。",
                    },
                    {
                        name: "join",
                        value: "ボイスチャンネルに接続します。",
                    },
                    {
                        name: "skip",
                        value: "再生中の音楽をスキップします。",
                    },
                    {
                        name: "pause",
                        value: "再生中の音楽を一時停止します。",
                    },
                    {
                        name: "resume",
                        value: "再生中の音楽を再開します。",
                    },
                    {
                        name: "stop",
                        value: "再生中の音楽を停止します。",
                    },
                    {
                        name: "loop",
                        value: "再生中の音楽をループします。",
                    },
                    {
                        name: "queueloop",
                        value: "キューをループします。",
                    },
                    {
                        name: "help",
                        value: "ヘルプを表示します。",
                    },
                    {
                        name: "dc",
                        value: "ボイスチャンネルから切断します。",
                    },
                ],
            }),
        ],
    });
}

async function play(message: Message<true>, args: string[]) {
    if (!message.member?.voice.channelId) {
        return;
    }
    const { player } = get(message.guildId!);
    if (!player) return;
    const arg = args.join(" ");
    if (!arg) {
        await message.reply("再生する内容が必須です。");
        return;
    }
    const yt = await ys(arg);
    if (!yt) {
        await message.reply("見つかりませんでした。");
        return;
    }
    await player.push(yt);
}

async function playlist(message: Message<true>, args: string[]) {
    if (!message.member?.voice.channelId) {
        return;
    }
    const { player } = get(message.guildId!);
    if (!player) return;
    const arg = args.join(" ");
    if (!arg) {
        await message.reply("再生する内容が必須です。");
        return;
    }
    const pl = await fetchPlaylist(arg);
    if (!pl) {
        await message.reply("見つかりませんでした。");
        return;
    }
    for (const video of pl) {
        await player.push(video, true);
    }
    await message.reply(`プレイリストから${pl.length}曲追加しました。`);
}

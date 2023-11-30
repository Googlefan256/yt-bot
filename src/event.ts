import { Message } from "discord.js";
import { Bot } from "./client";
import { info } from "./logger";
import { commands } from "./command";
import { env } from "./env";

export function onReady(client: Bot<true>) {
    info(`Logged in as ${client.user.tag}.`);
}

export async function onMessage(message: Message<true>) {
    if (!message.content.startsWith(env.Prefix)) {
        return;
    }
    const content = message.content.slice(env.Prefix.length);
    const [name, ...args] = content.split(/[ 　]+/g);
    if (name === "") return;
    const cmd = commands.find((c) => c.name == name || c.alias.includes(name));
    if (!cmd) return message.reply("コマンドが見つかりませんでした。");
    await cmd.run(message, args);
}

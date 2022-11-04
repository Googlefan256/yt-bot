"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const lib_1 = require("../lib");
exports.default = {
    name: "play",
    description: "音楽を再生します",
    options: [
        new discord_js_1.SlashCommandStringOption()
            .setName("曲")
            .setDescription("再生する曲のURLまたはキーワード")
            .setRequired(true),
    ],
    async exec(i) {
        let player = i.guildId
            ? i.client.player.get(i.guildId)
            : undefined;
        if (!i.guild?.voiceStates.cache.get(i.user.id)?.channelId) {
            return i.reply({
                embeds: [
                    new lib_1.EmbedBuilder()
                        .setTitle("エラー")
                        .setDescription("ボイスチャンネルに接続してください。"),
                ],
                ephemeral: true,
            });
        }
        if (player &&
            player.vchannel.id !==
                i.guild?.voiceStates.cache.get(i.user.id)?.channelId) {
            await i.reply({
                embeds: [
                    new lib_1.EmbedBuilder()
                        .setTitle("エラー")
                        .setDescription("同じボイスチャンネルに接続してください。"),
                ],
                ephemeral: true,
            });
            return null;
        }
        if (!player) {
            player = new lib_1.Voice(i.client, i.guild?.voiceStates.cache.get(i.user.id)?.channel, i.channel);
        }
        const query = i.options.getString("曲", true);
        const r = (await (0, lib_1.search)(query))[0];
        if (!r) {
            return i.reply({
                embeds: [
                    new lib_1.EmbedBuilder()
                        .setTitle("エラー")
                        .setDescription("曲が見つかりませんでした。"),
                ],
                ephemeral: true,
            });
        }
        const res = Object.assign(r, {
            requester: i.user.id,
        });
        if (!res) {
            return i.reply({
                embeds: [
                    new lib_1.EmbedBuilder()
                        .setTitle("エラー")
                        .setDescription("曲が見つかりませんでした。"),
                ],
                ephemeral: true,
            });
        }
        player.add(res, i);
    },
};

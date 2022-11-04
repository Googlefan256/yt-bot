"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const lib_1 = require("../lib");
const voice_1 = require("../lib/manager/voice");
exports.default = {
    name: "loop",
    description: "ループモードを切り替えます",
    options: [
        new discord_js_1.SlashCommandStringOption()
            .setName("モード")
            .setDescription("ループモードを指定します")
            .setRequired(true)
            .addChoices({ name: "無効", value: "none" }, { name: "現在の曲", value: "current" }, { name: "キュー", value: "track" }),
    ],
    async exec(i) {
        const player = await i.client.player.getPlayer(i);
        if (!player)
            return;
        const mode = i.options.getString("モード", true);
        const state = mode === "none"
            ? voice_1.PlayerLoopState.None
            : mode === "current"
                ? voice_1.PlayerLoopState.Current
                : voice_1.PlayerLoopState.Track;
        if (player.loopstate === state) {
            return i.reply({
                embeds: [
                    new lib_1.EmbedBuilder()
                        .setTitle("エラー")
                        .setDescription("すでにそのループモードは有効です。"),
                ],
                ephemeral: true,
            });
        }
        else {
            player.loopstate = state;
            return i.reply({
                embeds: [
                    new lib_1.EmbedBuilder()
                        .setTitle("情報")
                        .setDescription(`ループモードを${mode === "none"
                        ? "無効"
                        : mode === "current"
                            ? "現在の曲"
                            : "キュー"}に変更しました。`),
                ],
            });
        }
    },
};

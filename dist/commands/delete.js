"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const lib_1 = require("../lib");
exports.default = {
    name: "delete",
    description: "キューから指定した曲を削除します",
    options: [
        new discord_js_1.SlashCommandIntegerOption()
            .setName("曲")
            .setDescription("削除するトラックを指定します")
            .setRequired(true),
    ],
    async exec(i) {
        const player = await i.client.player.getPlayer(i);
        if (!player)
            return;
        const index = i.options.getInteger("曲", true);
        if (index > player.tracks.length || index < 1) {
            return i.reply({
                embeds: [
                    new lib_1.EmbedBuilder()
                        .setTitle("エラー")
                        .setDescription("指定された曲は存在しません。"),
                ],
                ephemeral: true,
            });
        }
        else {
            player.tracks = player.tracks.splice(index - 1, 1);
            return i.reply({
                embeds: [
                    new lib_1.EmbedBuilder()
                        .setTitle("情報")
                        .setDescription(`キューから${index}番目の曲を削除しました。`),
                ],
            });
        }
    },
};

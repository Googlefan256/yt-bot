"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const lib_1 = require("../lib");
exports.default = {
    name: "volume",
    description: "音量を変更します",
    options: [
        new discord_js_1.SlashCommandNumberOption()
            .setName("音量")
            .setDescription("音量を指定します")
            .setRequired(true)
            .setMaxValue(2)
            .setMinValue(0),
    ],
    async exec(i) {
        const player = await i.client.player.getPlayer(i);
        if (!player)
            return;
        const volume = i.options.getNumber("音量", true);
        player.setVolume(volume);
        return i.reply({
            embeds: [
                new lib_1.EmbedBuilder()
                    .setTitle("情報")
                    .setDescription(`音量を${volume}に変更しました。`),
            ],
        });
    },
};

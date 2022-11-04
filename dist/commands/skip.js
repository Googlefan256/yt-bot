"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("../lib");
exports.default = {
    name: "skip",
    description: "現在再生中の音楽をスキップします",
    async exec(i) {
        const player = await i.client.player.getPlayer(i);
        if (!player)
            return;
        await player.skip();
        return i.reply({
            embeds: [
                new lib_1.EmbedBuilder()
                    .setTitle("情報")
                    .setDescription("スキップしました。"),
            ],
        });
    },
};

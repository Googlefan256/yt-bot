"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("../lib");
exports.default = {
    name: "status",
    description: "botのステータスを表示します",
    async exec(i) {
        await i.reply({
            embeds: [
                new lib_1.EmbedBuilder()
                    .setTitle("情報")
                    .setDescription("ステータスを取得しています。"),
            ],
        });
        const [cpu, memory, uptime] = await Promise.all([
            (0, lib_1.getCpu)(),
            (0, lib_1.getMemory)(),
            (0, lib_1.getUptime)(),
        ]);
        return i.editReply({
            embeds: [
                new lib_1.EmbedBuilder()
                    .setTitle("情報")
                    .setDescription("ステータスを取得しました。")
                    .addFields({ name: "cpu使用率", value: `${cpu}%`, inline: true }, {
                    name: "メモリ使用量",
                    value: `プロセス: ${memory.process}MB,全体: ${memory.all}MB,合計メモリ: ${memory.total}MB`,
                    inline: true,
                }, {
                    name: "接続vc数",
                    value: i.client.player.size + "vc",
                    inline: true,
                }, {
                    name: "起動時間",
                    value: `プロセス: ${(0, lib_1.formatTime)(uptime.process)},サーバー: ${(0, lib_1.formatTime)(uptime.all)}`,
                    inline: true,
                }, {
                    name: "WebSocket速度",
                    value: `${i.client.ws.ping}ms`,
                    inline: true,
                }),
            ],
        });
    },
};

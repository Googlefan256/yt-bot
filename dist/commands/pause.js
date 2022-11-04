"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    name: "pause",
    description: "一時停止します",
    async exec(i) {
        const player = await i.client.player.getPlayer(i);
        if (!player)
            return;
        player.pause(i);
    },
};

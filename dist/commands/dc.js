"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const voice_1 = require("../lib/manager/voice");
exports.default = {
    name: "dc",
    description: "切断します",
    async exec(i) {
        const player = await i.client.player.getPlayer(i);
        if (!player)
            return;
        return player.destroy(voice_1.PlayerDestroyReason.Stopped, i);
    },
};

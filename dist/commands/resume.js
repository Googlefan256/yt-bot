"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    name: "resume",
    description: "再開します",
    async exec(i) {
        const player = await i.client.player.getPlayer(i);
        if (!player)
            return;
        player.resume(i);
    },
};

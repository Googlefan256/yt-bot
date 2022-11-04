import type { Bot, CommandOptions } from "../lib";

export default {
  name: "pause",
  description: "一時停止します",
  async exec(i) {
    const player = await (i.client as Bot).player.getPlayer(i);
    if (!player) return;
    player.pause(i);
  },
} as CommandOptions;

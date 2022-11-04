import type { Bot, CommandOptions } from "../lib";

export default {
  name: "resume",
  description: "再開します",
  async exec(i) {
    const player = await (i.client as Bot).player.getPlayer(i);
    if (!player) return;
    player.resume(i);
  },
} as CommandOptions;

import type { Bot, CommandOptions } from "../lib";
import { PlayerDestroyReason } from "../lib/manager/voice";

export default {
  name: "dc",
  description: "切断します",
  async exec(i) {
    const player = await (i.client as Bot).player.getPlayer(i);
    if (!player) return;
    return player.destroy(PlayerDestroyReason.Stopped, i);
  },
} as CommandOptions;

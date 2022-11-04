import { SlashCommandStringOption } from "discord.js";
import { Bot, CommandOptions, EmbedBuilder } from "../lib";
import { PlayerLoopState } from "../lib/manager/voice";

export default {
  name: "loop",
  description: "ループモードを切り替えます",
  options: [
    new SlashCommandStringOption()
      .setName("モード")
      .setDescription("ループモードを指定します")
      .setRequired(true)
      .addChoices(
        { name: "無効", value: "none" },
        { name: "現在の曲", value: "current" },
        { name: "キュー", value: "track" }
      ),
  ],
  async exec(i) {
    const player = await (i.client as Bot).player.getPlayer(i);
    if (!player) return;
    const mode = i.options.getString("モード", true);
    const state =
      mode === "none"
        ? PlayerLoopState.None
        : mode === "current"
        ? PlayerLoopState.Current
        : PlayerLoopState.Track;
    if (player.loopstate === state) {
      return i.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("エラー")
            .setDescription("すでにそのループモードは有効です。"),
        ],
        ephemeral: true,
      });
    } else {
      player.loopstate = state;
      return i.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("情報")
            .setDescription(
              `ループモードを${
                mode === "none"
                  ? "無効"
                  : mode === "current"
                  ? "現在の曲"
                  : "キュー"
              }に変更しました。`
            ),
        ],
      });
    }
  },
} as CommandOptions;

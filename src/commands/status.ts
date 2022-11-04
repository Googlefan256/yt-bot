import {
  type CommandOptions,
  EmbedBuilder,
  getCpu,
  getMemory,
  getUptime,
  type Bot,
  formatTime,
} from "../lib";

export default {
  name: "status",
  description: "botのステータスを表示します",
  async exec(i) {
    await i.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("情報")
          .setDescription("ステータスを取得しています。"),
      ],
    });
    const [cpu, memory, uptime] = await Promise.all([
      getCpu(),
      getMemory(),
      getUptime(),
    ]);
    return i.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle("情報")
          .setDescription("ステータスを取得しました。")
          .addFields(
            { name: "cpu使用率", value: `${cpu}%`, inline: true },
            {
              name: "メモリ使用量",
              value: `プロセス: ${memory.process}MB,全体: ${memory.all}MB,合計メモリ: ${memory.total}MB`,
              inline: true,
            },
            {
              name: "接続vc数",
              value: (i.client as Bot).player.size + "vc",
              inline: true,
            },
            {
              name: "起動時間",
              value: `プロセス: ${formatTime(
                uptime.process
              )},サーバー: ${formatTime(uptime.all)}`,
              inline: true,
            },
            {
              name: "WebSocket速度",
              value: `${i.client.ws.ping}ms`,
              inline: true,
            }
          ),
      ],
    });
  },
} as CommandOptions;

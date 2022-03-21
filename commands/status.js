import { Embed } from "../logic/embed.js"
import { MessageAttachment } from "discord.js"
import { getCpu, getMemory, getUptime } from "../logic/status.js"

export const name = "status"

export const raw = {
    name,
    description: ".."
}

export const exec = async function(i){
    await i.reply({embeds:[new Embed().setAuthor({name: "お待ちください", iconURL: "attachment://info.png"}).setDescription("取得しています...")],files: [new MessageAttachment("./assets/info.png","info.png")]})
    const [ cpu,memory,uptime ] = await Promise.all([getCpu(),getMemory(),getUptime()])
    return i.editReply({embeds:[new Embed().setAuthor({name: "取得しました！", iconURL: "attachment://ok.png"}).addFields({name: "cpu使用率",value: cpu,inline: true},{name: "メモリ使用量",value: `プロセス: ${memory.process},全体: ${memory.all},合計メモリ: ${memory.total}`,inline: true},{name: "サーバー数", value:i.client.guilds.cache.size + "個",inline: true}, {name: "接続vc数", value: i.client.players.size + "個", inline: true}, {name: "起動時間",value: `プロセス: ${uptime.process},サーバー: ${uptime.all}`,inline: true}).setThumbnail(i.client.user.displayAvatarURL({format: "png",size: 4096}))],files: [new MessageAttachment("./assets/ok.png","ok.png")]})
}
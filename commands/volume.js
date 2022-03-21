import { Embed } from "../logic/embed.js"
import { MessageAttachment } from "discord.js"

export const name = "volume"

export const raw = {
    name,
    description: "..",
    options: [
        {
            type: "NUMBER",
            description: "..",
            required: true,
            name: "volume",
            maxValue: 2,
            minValue: 0
        }
    ]
}

export const exec = async function(i){
    const player = i.client.players.get(i.guildId)
    if(!player)return i.reply({embeds:[new Embed().setAuthor({name: "エラー", iconURL: "attachment://error.png"}).setDescription("このサーバーでこのbotは音楽を再生していません")],files:[new MessageAttachment("./assets/error.png","error.png")]})
    if(!i.member.voice?.channel)return i.reply({embeds:[new Embed().setAuthor({name: "エラー", iconURL: "attachment://error.png"}).setDescription("ボイスチャンネルに参加してください！")],files:[new MessageAttachment("./assets/error.png","error.png")]})
    player.volume = i.options.getNumber("volume")
    return i.reply({embeds:[new Embed().setAuthor({name: "情報", iconURL: "attachment://info.png"}).setDescription(`音量が${player.volume}に設定されました！`)],files: [new MessageAttachment("./assets/info.png","info.png")]})
}
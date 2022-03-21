import { Embed } from "../logic/embed.js"
import { MessageAttachment } from "discord.js"

export const name = "delete"

export const raw = {
    name,
    description: "..",
    options: [
        {
            name: "number",
            required: true,
            type: "INTEGER",
            minValue: 1
        }
    ]
}

export const exec = async function(i){
    const player = i.client.players.get(i.guildId)
    if(!player)return i.reply({embeds:[new Embed().setAuthor({name: "エラー", iconURL: "attachment://error.png"}).setDescription("このサーバーでこのbotは音楽を再生していません")],files:[new MessageAttachment("./assets/error.png","error.png")]})
    if(!i.member.voice?.channel)return i.reply({embeds:[new Embed().setAuthor({name: "エラー", iconURL: "attachment://error.png"}).setDescription("ボイスチャンネルに参加してください！")],files:[new MessageAttachment("./assets/error.png","error.png")]})
    const n = i.options.getIntger("number")
    const select = player.tracks[n - 1]
    if(!select)return i.reply({embeds:[new Embed().setAuthor({name: "エラー", iconURL: "attachment://error.png"}).setDescription("その番号のトラックが見つかりませんでした！")],files:[new MessageAttachment("./assets/error.png","error.png")]})
    player.tracks = player.tracks.filter((x, i) => i !== n - 1)
    return i.reply({embeds:[new Embed().setAuthor({name: "成功", iconURL: "attachment://ok.png"}).setDescription(`${n}番目のトラック([${select.title}](${select.url}))を削除しました`)],files:[new MessageAttachment("./assets/ok.png","ok.png")]})
}
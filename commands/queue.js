import { Embed } from "../logic/embed.js"
import { MessageAttachment } from "discord.js"

export const resolveFields = function(f){
    return f.map((v, i) => [{name:`${i+1}番目`,value:`[${v.title}](${v.url})\n< \`${v.requester}\``}][0])
}

export const name = "queue"

export const raw = {
    name,
    description: ".."
}

export const exec = async function(i){
    const player = i.client.players.get(i.guildId)
    if(!player)return i.reply({embeds:[new Embed().setAuthor({name: "エラー", iconURL: "attachment://error.png"}).setDescription("このサーバーでこのbotは音楽を再生していません")],files:[new MessageAttachment("./assets/error.png","error.png")]})
    if(!i.member.voice?.channel)return i.reply({embeds:[new Embed().setAuthor({name: "エラー", iconURL: "attachment://error.png"}).setDescription("ボイスチャンネルに参加してください！")],files:[new MessageAttachment("./assets/error.png","error.png")]})
    return i.reply({embeds:[new Embed().setAuthor({name:i.guild.name, iconURL: i.guild.iconURL()}).addFields({name:"現在再生中",value:`[${player.now.title}](${player.now.url})\n> \`${player.now.requester}\``}).setFooter({text:`${player.loopstate === "single" ? "ループは有効です" : player.loopstate === "track" ? "トラックループは有効です" : "ループは無効です"} | 音量は${player.volume}に設定されています`}).addFields(...resolveFields(player.tracks.slice(0,24)))]})
}
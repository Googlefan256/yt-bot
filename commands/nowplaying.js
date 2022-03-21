import { Embed } from "../logic/embed.js"
import { MessageAttachment } from "discord.js"

export const name = "nowplaying"

export const raw = {
    name,
    description: ".."
}

export const exec = async function(i){
    const player = i.client.players.get(i.guildId)
    if(!player)return i.reply({embeds:[new Embed().setAuthor({name: "エラー", iconURL: "attachment://error.png"}).setDescription("このサーバーでこのbotは音楽を再生していません")],files:[new MessageAttachment("./assets/error.png","error.png")]})
    if(!i.member.voice?.channel)return i.reply({embeds:[new Embed().setAuthor({name: "エラー", iconURL: "attachment://error.png"}).setDescription("ボイスチャンネルに参加してください！")],files:[new MessageAttachment("./assets/error.png","error.png")]})
    const video = player.now
    return i.reply({embeds:[new Embed().setAuthor({name:video.author.name,iconURL:video.author.avatar}).setTitle(video.title).setURL(video.url).setDescription(video.description).setImage(video.image).setFooter({text:`再生中です | Requested By ${video.requester}`})]})
}
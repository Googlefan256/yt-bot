import { MessageActionRow, MessageAttachment } from "discord.js"
import { Button } from "./link.js"
import { search as yts } from "yt-search"
import { Embed } from "./embed.js"
import ytdl from "ytdl-core"

export const search = (q) => yts(q).then(v => v.videos.slice(0,5)).catch(() => [])

export const Embedlize = (q) => search(q)
    .then(results => {
        if(!results.length)return {embeds:[new Embed().setAuthor({name:"エラー",iconURL:"attachment://error.png"}).setDescription("検索結果が見つかりませんでした...\n検索語句を変えて再検索してみてください\n(検索のしすぎによるエラーの可能性もあります)")],files:[new MessageAttachment("./assets/error.png","error.png")]}
        return {embeds:[new Embed().setAuthor({name:"YouTubeの検索結果",iconURL:"attachment://youtube.png"}).setDescription(results.map(result => `[${result.title}](${result.url})\n> ${result.description.replace(/\n/g,"\n> ")}\n[${result.author.name}](${result.author.url})`).join("\n\n"))],files:[new MessageAttachment("./assets/youtube.png","youtube.png")],components:[new MessageActionRow().addComponents(new Button().setURL(`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`).setLabel("もっと見る").setEmoji("🔎"))]}
    })

export const resolveId = (q) => {
    try{
        return ytdl.getVideoID(q)
    }catch{
        return null
    }
}
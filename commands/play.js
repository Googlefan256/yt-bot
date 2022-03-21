import { search, resolveId } from "../logic/search.js";
import ytdl from "ytdl-core";
import { Embed } from "../logic/embed.js"
import { Player } from "../logic/connection.js";
import { MessageAttachment } from "discord.js";

const formatDetail = function(i,d){
    const u = {
        title: d.title,
        author: {name:d.author.name,url:d.author.channel_url || d.author.url,avatar: d.author.thumbnails?.reverse()[0].url},
        image: d.image || d.thumbnails.reverse()[0].url,
        videoId: d.videoId,
        url: d.url || d.video_url,
        description: d.description,
        requester: i.user.tag,
    }
    return u
}

export const name = "play"

export const raw = {
    name,
    description: "..",
    options: [
        {
            type: "SUB_COMMAND",
            name: "search",
            description: "..",
            options :[
                {
                    type: "STRING",
                    name: "value",
                    description: "..",
                    required: true
                }
            ]
        },
        {
            type: "SUB_COMMAND",
            name: "url",
            description: "..",
            options :[
                {
                    type: "STRING",
                    name: "value",
                    description: "..",
                    required: true
                }
            ]
        }
    ]
}

export const play = async function(i,detail){
    const video = formatDetail(i,detail)
    if(!i.client.players.has(i.guildId)){
        const player = new Player(i.client)
        await player.join(i.member.voice.channel,i.channel)
        player
            .on("playing",(video) => player.TextChannel.send({embeds:[new Embed().setAuthor({name:video.author.name,iconURL:video.author.avatar}).setTitle(video.title).setURL(video.url).setDescription(video.description).setImage(video.image).setFooter({text:`再生中です | Requested By ${video.requester}`})]}))
            .once("end", async() => {
                await player.destroy()
                return player.TextChannel.send({embeds:[new Embed().setAuthor({name: "情報", iconURL: "attachment://info.png"}).setDescription("曲がなくなったため、再生を終了しました。")],files: [new MessageAttachment("./assets/info.png","info.png")]})
            })
            .once("kicked", () => {
                const channel = player.TextChannel
                return channel.send({embeds:[new Embed().setAuthor({name: "エラー", iconURL: "attachment://error.png"}).setDescription("切断されたため、再生が終了しました。")],files:[new MessageAttachment("./assets/error.png","error.png")]})
            })
    }
    return i.client.players.get(i.guildId).add(video)
}

export const from = {
    url: async(i, value) => {
        let id = resolveId(value)
        if(!id)return i.editReply({embeds:[new Embed().setAuthor({name: "エラー", iconURL: "attachment://error.png"}).setDescription("曲が見つかりませんでした")],files:[new MessageAttachment("./assets/error.png","error.png")]})
        try{
            const video = await play(i,(await ytdl.getBasicInfo(id)).videoDetails)
            return i.editReply({embeds:[new Embed().setAuthor({name:video.video.author.name,iconURL:video.video.author.avatar}).setTitle(video.video.title).setURL(video.video.url).setDescription(video.video.description).setFooter({text:video.status === "playing" ? "再生中です" : "リストに追加されました"})],files:[]})
        }catch{
            return i.editReply({embeds:[new Embed().setAuthor({name: "エラー", iconURL: "attachment://error.png"}).setDescription("曲が見つかりませんでした")],files:[new MessageAttachment("./assets/error.png","error.png")]})
        }
    },
    search: async(i, value) => {
        const result = await search(value)
        if(!result.length)return i.editReply({embeds:[new Embed().setAuthor({name: "エラー", iconURL: "attachment://error.png"}).setDescription("検索結果がありませんでした")],files:[new MessageAttachment("./assets/error.png","error.png")]})
        try{
            const video = await play(i,result[0])
            return i.editReply({embeds:[new Embed().setAuthor({name:video.video.author.name,iconURL:video.video.author.avatar}).setTitle(video.video.title).setURL(video.video.url).setImage(video.video.image).setDescription(video.video.description).setFooter({text:video.status === "playing" ? "再生中です" : "リストに追加されました"})],files:[]})
        }catch{
            return i.editReply({embeds:[new Embed().setAuthor({name: "エラー", iconURL: "attachment://error.png"}).setDescription("曲が再生できませんでした")],files:[new MessageAttachment("./assets/error.png","error.png")]})
        }
    }
}

export const exec = async function(i){
    if(!i.member.voice?.channel)return i.reply({embeds:[new Embed().setAuthor({name: "エラー", iconURL: "attachment://error.png"}).setDescription("ボイスチャンネルに参加してください！")],files:[new MessageAttachment("./assets/error.png","error.png")]})
    if(!i.member.voice.channel.joinable)return i.reply({embeds:[new Embed().setAuthor({name: "エラー", iconURL: "attachment://error.png"}).setDescription("ボイスチャンネルに接続出来ません！")],files:[new MessageAttachment("./assets/error.png","error.png")]})
    if(!i.member.voice.channel.speakable)return i.reply({embeds:[new Embed().setAuthor({name: "エラー", iconURL: "attachment://error.png"}).setDescription("ボイスチャンネルで発言出来ません！")],files:[new MessageAttachment("./assets/error.png","error.png")]})
    const player = i.client.players.get(i.guildId)
    if(player && player.VoiceChannel.id !== i.member.voice.channel.id)return i.reply({embeds:[new Embed().setAuthor({name: "エラー", iconURL: "attachment://error.png"}).setDescription("別のボイスチャンネルに参加しています！")],files:[new MessageAttachment("./assets/error.png","error.png")]})
    await i.reply({embeds:[new Embed().setAuthor({name: "お待ちください", iconURL: "attachment://info.png"}).setDescription("曲の情報を取得しています....")],files: [new MessageAttachment("./assets/info.png","info.png")]})
    return from[i.options.getSubcommand()](i, i.options.getString("value"))
}
import { Embed } from "../logic/embed.js"
import { MessageAttachment } from "discord.js"

export const name = "loop"

export const raw = {
    name,
    description: "..",
    options: [
        {
            type: "SUB_COMMAND",
            name: "none",
            description: ".."
        },
        {
            type: "SUB_COMMAND",
            name: "single",
            description: ".."
        },
        {
            type: "SUB_COMMAND",
            name: "track",
            description: ".."
        }
    ]
}

export const exec = async function(i){
    const player = i.client.players.get(i.guildId)
    if(!player)return i.reply({embeds:[new Embed().setAuthor({name: "エラー", iconURL: "attachment://error.png"}).setDescription("このサーバーでこのbotは音楽を再生していません")],files:[new MessageAttachment("./assets/error.png","error.png")]})
    if(!i.member.voice?.channel)return i.reply({embeds:[new Embed().setAuthor({name: "エラー", iconURL: "attachment://error.png"}).setDescription("ボイスチャンネルに参加してください！")],files:[new MessageAttachment("./assets/error.png","error.png")]})
    const type = i.options.getSubcommand()
    if(player.loopstate === type)return i.reply({embeds:[new Embed().setAuthor({name: "エラー", iconURL: "attachment://error.png"}).setDescription(`ループモードは既に${type === "single" ? "曲ループ" : type === "track" ? "トラックループ" : "なし"}です`)],files:[new MessageAttachment("./assets/error.png","error.png")]})
    player.loopstate = type
    return i.reply({embeds:[new Embed().setAuthor({name: "情報", iconURL: "attachment://info.png"}).setDescription(`ループモードが${type === "single" ? "曲ループ" : type === "track" ? "トラックループ" : "なし"}に変更されました`)],files: [new MessageAttachment("./assets/info.png","info.png")]})
}
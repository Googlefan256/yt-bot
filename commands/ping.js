import {Embed} from "../logic/embed.js"
import {MessageAttachment} from "discord.js"

export const name = "ping"

export const raw = {
    name,
    description: ".."
}

export const exec = async function(i){
    let time = Date.now()
    await i.reply({embeds:[new Embed().setDescription("測定しています...")]})
    time = Date.now() - time
    return i.editReply({embeds:[new Embed().setAuthor({name:"測定しました!",iconURL:"attachment://ping_pong.png"}).setDescription(`EDIT: ${time}ms\nAPI: ${i.client.ws.ping}ms`)],files:[new MessageAttachment("./assets/ping_pong.png","ping_pong.png")]})
}
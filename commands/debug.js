import { Embedlize } from "../logic/run.js"
import { Embed } from "../logic/embed.js"
import { MessageAttachment } from "discord.js"

export const name = "debug"

export const raw = {
    name,
    description: "..",
    options:[
        {
            type: "SUB_COMMAND",
            name: "js",
            description: "..",
            options: [
                {
                    name: "code",
                    description: "..",
                    type: "STRING",
                    required: true
                }
            ]
        },
        {
            type: "SUB_COMMAND",
            name: "sh",
            description: "..",
            options: [
                {
                    name: "code",
                    description: "..",
                    type: "STRING",
                    required: true
                }
            ]
        }
    ]
}

export const exec = async function(i){
    if(!i.client.owners.find(u => u.equals(i.user)))return i.reply({embeds:[new Embed().setAuthor({name:"コマンドはbotの所有者専用です",iconURL:"attachment://error.png"}).setDescription(`あなたはこのコマンドを使えません\n使えるユーザー:${i.client.owners.map(a=>a.tag).map(x => `\`${x}\``).join(" , ")}`)],files:[new MessageAttachment("./assets/error.png","error.png")],ephemeral:true});
    await i.reply({embeds:[new Embed().setDescription("コードを実行中です...")]})
    return Embedlize(i,i.options.getSubcommand()).then(payload => i.editReply(payload))
}
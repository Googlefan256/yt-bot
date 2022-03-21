import { inspect } from "util"
import { exec } from "child_process"
import { Embed } from "./embed.js"
import { MessageAttachment } from "discord.js"
import * as Discord from "discord.js"
import fetch from "node-fetch"
import { Player } from "./connection.js"
import ytdl from "ytdl-core"
import yts from "yt-search"

export const _js = (i) => {
    const client = i.client
    return new Promise(resolve => resolve(eval(i.options.getString("code"))))
        .then(result => inspect(result,{showHidden:true}))
        .catch(error => inspect(error))
}

export const _sh = (i) => 
    new Promise(resolve => exec(i.options.getString("code"),(error,stdout,stderr) => {
        if(error)return resolve(inspect(error,{showHidden:true}))
        if(stderr)return resolve(stderr)
        return resolve(stdout)
    }))

export const Embedlize = (i,type) => 
    (type === "js" ? _js(i) : type === "sh" ? _sh(i) : new Promise(resolve => resolve()))
        .then(result => result.replace(new RegExp(i.client.token,"g"),"[TOKEN]"))
        .then(str => str.length > 4086 ? {embeds:[new Embed().setAuthor({name:"実行結果",iconURL:"attachment://ok.png"})],files:[new MessageAttachment(Buffer.from(str,"utf-8"),`result.${type}`),new MessageAttachment("./assets/ok.png","ok.png")]}: {embeds:[new Embed().setAuthor({name:"実行結果",iconURL:"attachment://ok.png"}).setDescription(`\`\`\`${type}\n${str}\n\`\`\``)],files:[new MessageAttachment("./assets/ok.png","ok.png")]})
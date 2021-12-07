import { Collection, MessageActionRow, MessageButton, MessageEmbed } from "discord.js"
const playing = new Collection()
const queuemenu = new Collection()
import { createAudioPlayer, joinVoiceChannel, VoiceConnectionStatus, createAudioResource, StreamType, AudioPlayerStatus } from "@discordjs/voice"
import ytdl from "ytdl-core"
import yts from "yt-search"
import {inspect} from "util"
import {readFileSync} from "fs"
import {cpus} from "os"
import sleep from "./utils/sleep.mjs"
global.queuemenu = queuemenu

class ytConnection{
    loop = false
    queueLoop = false
    pauseing = false
    constructor(channel){
        this.guildId = channel.guildId
        this.connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guildId,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });
        this.player = createAudioPlayer()
        this.connection.subscribe(this.player)
        this.queue = []
        const self = this
        this.connection.once(VoiceConnectionStatus.Disconnected,()=>self.player.stop())
    }
    leave(){
        playing.delete(this.guildId)
        this.player.stop()
        return this.connection.destroy()
    }
    _play(data){
        this.queue.push(data)
        if(this.queue.length > 1)return "queue"
        this._basePlay(data)
        return "play"
    }
    _basePlay(data){
        this.skkiping = false
        this.playing = true
        const self = this
        const stream = ytdl(ytdl.getURLVideoID(data.url), {
            filter: format => format.audioCodec === 'opus' && format.container === 'webm',
            quality: 'highest',
            highWaterMark: 32 * 1024 * 1024,
        });
        const resource = createAudioResource(stream, {
           inputType: StreamType.WebmOpus
        });
        this.__play_____________(resource)
        this.player.once(AudioPlayerStatus.Idle,()=>{
            if(self.skkiping)return
            if(this.queueLoop && !this.loop)this.queue.push(this.queue[0])
            if(!self.loop)self.queue.shift()
            if(self.queue.length === 0)return self.leave()
            self._basePlay(this.queue[0])
        })
    }
    __play_____________(resource){
        try{
            this.player.play(resource)
        }catch{
            sleep(1000).then(()=>this.__play_____________(resource))
        }
    }
    skip(){
        this.skkiping = true
        if(this.queueLoop && !this.loop)this.queue.push(this.queue[0])
        if(!this.loop)this.queue.shift()
        if(!this.queue[0])return this.leave()
        this._basePlay(this.queue[0])
    }
    loop(){
        this.loop = true
    }
    unloop(){
        this.loop = false
    }
    queueLoop(){
        this.queueLoop = true
    }
    unqueueLoop(){
        this.queueLoop = false
    }
    pause(){
        this.pauseing = true
        this.player.pause()
    }
    resume(){
        this.pauseing = false
        this.player.unpause()
    }
}
export const play = {
    aliases: ["p"],
    run: async function(message,args){
        if(!message.member.voice || !message.member.voice.channel)return message.reply(process.lang["plz-join"])
        if(!message.member.voice.channel.joinable)return message.reply(process.lang["cannot-join"].replace("{channel}","<#"+message.member.voice.channelId+">"))
        if(!message.guild.me.voice.channel)playing.set(message.guildId,new ytConnection(message.member.voice.channel))
        const connection = playing.get(message.guildId) || new ytConnection(message.member.voice.channel)
        playing.set(message.guildId,connection)
        const v = await yts(args.join(" "))
            .then(a=>{
                const v = a.videos[0]
                return {
                    title: v.title,
                    description: v.description,
                    url: v.url,
                    image: v.image,
                    views: v.views,
                    author: v.author,
                    ask: {tag:message.author.tag,avatar:message.author.displayAvatarURL()}
                }
            })
            .catch(()=>{return})
        if(!v)return message.channel.send(process.lang["no-video"])
        const e = new MessageEmbed().setColor("NAVY")
        const p = connection._play(v)
        if(p === "queue")e.setFooter(process.lang.queue.add)
        if(p === "play")e.setFooter(process.lang.queue.playing)
        e.setImage(v.image)
        e.setAuthor(v.author.name,null,v.author.url)
        e.setDescription(v.description)
        e.setTitle(v.title)
        return message.reply({embeds:[e],components:[new MessageActionRow().addComponents(new MessageButton().setStyle("LINK").setLabel("youtube").setURL(v.url))]})
    }
}

export const loop = {
    run: async function(message,args){
        if(!message.member.voice || !message.member.voice.channel)return message.reply(process.lang["plz-join"])
        if(!playing.get(message.guildId))return message.channel.send(process.lang["bot-not-join"])
        if(!["true","false"].includes(args[0]))return message.channel.send(process.lang["boolean"])
        playing.get(message.guildId).loop = JSON.parse(args[0])
        return message.reply(process.lang["changed"])
    }
}

export const queueloop = {
    aliases:["ql"],
    run: async function(message,args){
        if(!message.member.voice || !message.member.voice.channel)return message.reply(process.lang["plz-join"])
        if(!playing.get(message.guildId))return message.channel.send(process.lang["bot-not-join"])
        if(!["true","false"].includes(args[0]))return message.channel.send(process.lang["boolean"])
        playing.get(message.guildId).queueLoop = JSON.parse(args[0])
        return message.reply(process.lang["changed"])
    }
}

export const skip = {
    aliases: ["sk","s"],
    run: async function(message,args){
        if(!message.member.voice || !message.member.voice.channel)return message.reply(process.lang["plz-join"])
        if(!playing.get(message.guildId))return message.channel.send(process.lang["bot-not-join"])
        playing.get(message.guildId).skip()
        return message.reply(process.lang["skip"])
    }
}

export const leave = {
    aliases:["dc","stop"],
    run: async function(message,args){
        if(!message.member.voice || !message.member.voice.channel)return message.reply(process.lang["plz-join"])
        if(!playing.get(message.guildId))return message.channel.send(process.lang["bot-not-join"])
        playing.get(message.guildId).leave()
        return message.reply(process.lang["leave"])
    }
}

export const queue = {
    aliases:["q"],
    run: async function(message,args){
        if(!message.member.voice || !message.member.voice.channel)return message.reply(process.lang["plz-join"])
        if(!playing.get(message.guildId))return message.channel.send(process.lang["bot-not-join"])
        const e = new MessageEmbed().setColor("NAVY")
        const ms = playing.get(message.guildId).queue.map((a,b)=>[{name:process.lang["th-song"].replace("{n}",String(b+1)),value:`[${a.title}](${a.url})\n${process.lang["requested-by"].replace("{tag}",`\`${a.ask.tag}\``)}`}][0])
        e.addFields(...ms.slice(0,25))
        e.setTitle(process.lang["queueask"].replace("{guild}",message.guild.name))
        e.setThumbnail(message.guild.iconURL())
        if(playing.get(message.guildId).queueLoop)e.setFooter(process.lang["queue-loop-enabled"])
        if(playing.get(message.guildId).loop)e.setFooter(process.lang["loop-enabled"])
        if(ms.length <= 25)return message.reply({embeds:[e]})
        const pages = []
        let r = ms
        while(r.length > 0){
            if(e.footer?.text)pages.push(new MessageEmbed().setFooter(e.footer?.text).setTitle(process.lang["queueask"].replace("{guild}",message.guild.name)).setColor("NAVY").addFields(...r.slice(0,25)).setThumbnail(message.guild.iconURL()))
            else pages.push(new MessageEmbed().setTitle(process.lang["queueask"].replace("{guild}",message.guild.name)).setColor("NAVY").addFields(...r.slice(0,25)))
            r = r.slice(25)
        }
        return message.reply({embeds:[e],components:[new MessageActionRow().addComponents(new MessageButton().setStyle("PRIMARY").setCustomId("queue-0").setEmoji("⬅️")).addComponents(new MessageButton().setStyle("PRIMARY").setCustomId("queue-2").setEmoji("➡️"))]})
            .then(a=>queuemenu.set(a.id,pages))
    }
}

export const np = {
    aliases: ["now","nowplaying"],
    run: async function(message,args){
        if(!message.member.voice || !message.member.voice.channel)return message.reply(process.lang["plz-join"])
        if(!playing.get(message.guildId))return message.channel.send(process.lang["bot-not-join"])
        const r = playing.get(message.guildId).queue[0]
        message.reply({embeds:[
            new MessageEmbed()
                .setColor("NAVY")
                .setDescription(r.description)
                .setTitle(r.title)
                .setFooter(r.ask.tag,r.ask.avatar)
                .setAuthor(r.author.name,null,r.author.url)
                .setImage(r.image)
        ],components:[new MessageActionRow().addComponents(new MessageButton().setStyle("LINK").setLabel("youtube").setURL(r.url))]})
    }
}

export const pause = {
    aliases: ["ps"],
    run: async function(message,args){
        if(!message.member.voice || !message.member.voice.channel)return message.reply(process.lang["plz-join"])
        if(!playing.get(message.guildId))return message.channel.send(process.lang["bot-not-join"])
        if(playing.get(message.guildId).pauseing)return message.channel.send(process.lang["pause"]["already"])
        playing.get(message.guildId).pause()
        return message.channel.send(process.lang["paused"])
    }
}

export const resume = {
    aliases: ["re","unpause"],
    run: async function(message,args){
        if(!message.member.voice || !message.member.voice.channel)return message.reply(process.lang["plz-join"])
        if(!playing.get(message.guildId))return message.channel.send(process.lang["bot-not-join"])
        if(!playing.get(message.guildId).pauseing)return message.channel.send(process.lang["pause"]["not"])
        playing.get(message.guildId).resume()
        return message.channel.send(process.lang["unpaused"])
    }
}

function forceURL(url){
    try{
        const u = new URL(url)
        return u
    }catch{
        return null
    }
}

async function ytpl(url,message){
    let id = url
    if(id.length !== 34){
        id = forceURL(url)
        if(!id)return
        try{
            id = id.search.slice(1).split("&").map(a=>a.split("=")).find(a=>a[0] === "list")
            if(!id)return
            id = id[1]
        }catch{
            return
        }
    }
    return yts({listId:id})
        .then(a=>Promise.all(a.videos.map(b=>yts({videoId:b.videoId}))))
        .then(vs=>vs.map(v=>{
            return {
                title: v.title,
                description: v.description,
                url: v.url,
                image: v.image,
                views: v.views,
                author: v.author,
                ask: {tag:message.author.tag,avatar:message.author.displayAvatarURL()}
            }
        }))
        .catch(()=>{return})
}

export const pl = {
    aliases: ["playlist"],
    run: async function(message,args){
        if(!message.member.voice || !message.member.voice.channel)return message.reply(process.lang["plz-join"])
        if(!message.member.voice.channel.joinable)return message.reply(process.lang["cannot-join"].replace("{channel}","<#"+message.member.voice.channelId+">"))
        if(!message.guild.me.voice.channel)playing.set(message.guildId,new ytConnection(message.member.voice.channel))
        const connection = playing.get(message.guildId) || new ytConnection(message.member.voice.channel)
        playing.set(message.guildId,connection)
        const vs = await ytpl(args[0] || "",message)
        if(!vs)return message.channel.send(process.lang["no-video"])
        vs.map(a=>connection._play(a))
        return message.reply(process.lang["add-many"].replace("{n}",String(vs.length)))
    }
}

export const help = {
    run: async function(message){
        const helps = process.lang["helps"]
        const keys = Object.keys(helps)
        return message.channel.send({embeds:[
            new MessageEmbed()
                .setColor("NAVY")
                .setAuthor(message.author.tag,message.author.displayAvatarURL())
                .addFields(...Object.values(helps).map((v,l)=>[{name:keys[l],value:v,inline:true}][0]))
        ]})
    }
}

export const ping = {
    run: async function(message){
        return message.reply("Pong! with" + message.client.ws.ping + "ms")
    }
}

export const ev = {
    aliases: ["eval"],
    run: async function(message,args){
        if(message.author.id !== process.env.OWNER_ID)return message.channel.send(process.lang["you-cannot-eval"])
		const content = args.join(" ");
		const msg = message;
		const client = message.client;
		const users = message.client.users;
		const channels = message.client.channels;
		const channel = message.channel;
		const guild = message.guild;
		const result = new Promise((resolve) => resolve(eval(content)));
		return result
			.then(async (output) => {
				if (typeof output !== "string") {
					output = inspect(output, { depth: 0 });
				}
				if (output.includes(message.client.token)) {
					output = output.replace(message.client.token, "[TOKEN]");
				}
				message.react("✅");
				message.reply(`\`\`\`js\n${output}\n\`\`\``)
			})
			.catch(async (err) => {
				err = err.toString();
				if (err.includes(message.client.token)) {
					err = err.replace(message.client.token, "[TOKEN]");
				}
				message.react("❌");
				message.reply(`\`\`\`js\n${err}\n\`\`\``)
			});
    }
}

function depends(){
    const d = JSON.parse(readFileSync("package.json","utf-8")).dependencies
    const v = Object.values(d)
    return Object.keys(d).map((a,b)=> a + ": " + v[b].slice(1)).join("\n")
}

function cpu(){
    const r = cpus().map(a=>Object.values(a.times)).map(a=>[a[0],a.reduce((b,c)=>b+c)]).reduce((a,b)=>[a[0]+b[0],a[1]+b[1]])
    return Math.floor(r[0] / r[1] * 10000) / 100 + "%"
}

export const status = {
    run: async function(message){
        message.reply({embeds:[
            new MessageEmbed()
                .setColor("NAVY")
                .setTitle(process.lang["status"]["title"])
                .addField(process.lang["status"]["memory"],Math.floor(process.memoryUsage.rss()/1024/1024*100)/100+"MB",true)
                .setDescription(`\`\`\`md\n${depends()}\n\`\`\``)
                .addField(process.lang["status"]["cpu"],cpu(),true)
        ]})
    }
}
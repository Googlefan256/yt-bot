console.log("Importing files...")
if(Number(process.versions.node.split(".")[0]) <= 15){
    console.log("nodejs over v16 is required!!\nyour nodejs is " + process.versions.node)
    process.exit()
}
import dotenv from "dotenv"
import { Client, Collection, MessageActionRow, MessageButton } from "discord.js"
import chalk from "chalk"
import { readFileSync } from "fs"
import { loading,error,createdDebug } from "./utils/betterstdout.mjs"

dotenv.config()

if(!["true","false"].includes(process.env.DEBUG))error("DEBUG MUST BE true OR false AT .env FILE")
if(!["true","false"].includes(process.env.COMMAND_LOGS))error("COMMAND_LOGS MUST BE true OR false AT .env FILE")
if(!["true","false"].includes(process.env.ERRORS))error("ERRORS MUST BE true OR false AT .env FILE")
if(!["true","false"].includes(process.env.QUEUEMENU_LOGS))error("QUEUEMENU_LOGS MUST BE true OR false AT .env FILE")

const client = new Client({ intents: 641,allowedMentions:{ repliedUser: false } })
const debug = createdDebug({debugs:JSON.parse(process.env.DEBUG),errors:JSON.parse(process.env.ERRORS),commands:JSON.parse(process.env.COMMAND_LOGS),queuemenus:JSON.parse(process.env.QUEUEMENU_LOGS)})

console.log(chalk.green("Importing Completed"));

if(!process.env.DISCORD_TOKEN)error(chalk.yellowBright("DISCORD_TOKEN")+" IS MISSING AT .env FILE")
debug("token is setted")
if(!process.env.PREFIX)error(chalk.yellowBright("PREFIX")+" IS MISSING AT .env FILE")
debug("prefix is setted to " + chalk.cyan(process.env.PREFIX))
if(!process.env.OWNER_ID)error(chalk.yellowBright("OWNER_ID")+" IS MISSING AT .env FILE")
debug("loading discord exts")
try{
    process.lang = JSON.parse(readFileSync("./src/lang/"+process.env.LANGUAGE.toLowerCase()+".json"))
}catch(err){
    error(chalk.yellowBright("LANGUAGE")+" IS INCORRECT AT .env FILE")
}
debug("lang is setted to " + chalk.cyan(process.env.LANGUAGE))

debug("showing loading stdouts")
const p = new loading({each:500,text:chalk.green("Your Bot is booting now "),color:chalk.yellowBright,type:1}).start()

debug("loading commands")
import * as commandObject from "./commands.mjs"
const commands = new Collection()
Object.values(commandObject).map((a,b)=>{
    a.name = Object.keys(commandObject)[b]
    commands.set(a.name,a)
})
debug("loaded " + chalk.cyan(commands.size) + " commands")

client.once("ready",async()=>{
    await p.stop()
    debug("stopped loading stdouts")
    process.stdout.write(chalk.magenta(readFileSync("./src/utils/googlefan.txt","utf-8")))
    process.stdout.write(chalk.cyan("Your bot is ready as ") + chalk.yellow(client.user.tag) + chalk.cyan(" !\n"))
    debug("bot ready")
    client.users.fetch(process.env.OWNER_ID)
        .then(user=>debug("owner setted to " + chalk.cyan(user.tag) + "(" + chalk.cyan(user.id) +  ")"))
        .catch(()=>error("CANNNOT FIND THE OWNER "+chalk.yellowBright(process.env.OWNER_ID)))
    setInterval(()=>{
        client.user.setActivity(process.lang["activity"].replace("{n}",String(client.guilds.cache.size).replace("{prefix}",process.env.PREFIX)),{type:"PLAYING"})
    },5000)
})

client.on("messageCreate",async message=>{
    if(!message.content || !message.author || message.author.bot || !message.content.startsWith(process.env.PREFIX))return
    const args = message.content.slice(process.env.PREFIX.length).trim().split(/ /g)
    const name = args.shift()
    const cmd = commands.find(a=>a.name === name || a.aliases?.includes(name))
    if(!cmd)return
    debug.command(message)
    try{
        await cmd.run(message,args)
    }catch(err){
        debug("(" + chalk.cyan(cmd.name) + ")Error caused: " + chalk.redBright(err.message))
    }
})

client.on("interactionCreate",i=>{
    if(i.isButton() && i.customId.startsWith("queue-"))return client.emit("queuemenu",i)
})

client.on("queuemenu",i=>{
    if(!global.queuemenu.get(i.message.id))return i.update({embeds:[],components:[],content:process.lang["disabled-queuemenu"]})
    debug.queuemenu(i)
    const num = Number(i.customId.slice(6))
    if(num === 0 || num > global.queuemenu.get(i.message.id).length)return;
    i.update({embeds:[global.queuemenu.get(i.message.id)[num - 1]],components:[new MessageActionRow().addComponents(new MessageButton().setStyle("PRIMARY").setCustomId("queue-" + (num - 1)).setEmoji("⬅️")).addComponents(new MessageButton().setStyle("PRIMARY").setCustomId("queue-" + (num + 1)).setEmoji("➡️"))]})
})

debug("discord exts loaded")

client.login(process.env.DISCORD_TOKEN)
    .catch(err=>{
        if(err.message === "TOKEN_INVALID")error("THE TOKEN WAS INVAID")
        error("THERE WAS A ERROR CAUSED MABE BY A RATE LIMIT")
    })

process.on("uncaughtException",err=>debug.error(err.toString()))
process.on("unhandledRejection",err=>debug.error(err.toString()))
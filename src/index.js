/*
 * load environment settings
 */
import dotenv from "dotenv"
dotenv.config()

/*
 * load the bot
 */
import * as Discord from "./discord.js"

const bot = new Discord.Bot()

bot.start()

bot.on("interactionCreate",i => i.isCommand() ? bot.emit("command",i) : i.isButton() ? bot.emit("button",i) : i.isSelectMenu() ? bot.emit("select",i) : null)

bot.on("command", async i => {
    const cmd = bot.commands.get(i.commandName)
    if(!cmd)return
    await cmd.exec(i)
})

bot.on("error",console.log)

bot.on("ready", () => 
    setInterval(() => {
        bot.user.setActivity({name: "/help でコマンド一覧を表示します",type: "STREAMING"})
        setTimeout(() => bot.user.setActivity({name: `${bot.players.size}vc / ${bot.guilds.cache.size}guilds`,type: "STREAMING"}), 5000)
    }, 10000)
)

process.on("uncaughtException",console.log)

process.on("unhandledRejection",console.log)
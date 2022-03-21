export * from "discord.js"

import { Client,Intents as _Intents } from "discord.js"
const Flags = _Intents.FLAGS

import { CommandManager } from "../logic/commandmanager.js"

import { VoiceManager } from "../logic/connection.js"

/*
 * class which extends discordjs/client 
 */
export const Bot = class Bot extends Client{
    constructor({Intents} = {}){
        const intents = new _Intents([Flags.GUILDS,Flags.GUILD_INTEGRATIONS,Flags.GUILD_VOICE_STATES])
        if(Intents)intents.add(Intents)
        super({intents})
        this.commands = new CommandManager(this)
        this.players = new VoiceManager(this)
    }
    async start(){
        await this.commands.loadAll()
        await this.login()
        this.owners = await new Promise(resolve => this.once("ready", () => resolve(Promise.all(JSON.parse(process.env.OWNER_ID).map(id => this.users.fetch(id))))))
        await this.application.commands.fetch()
        await Promise.all(this.commands.map(c => {if(!this.application.commands.cache.find(x => x.name === c.name))return this.application.commands.create(c.raw);else{return null;}}))
        return null;
    }
}
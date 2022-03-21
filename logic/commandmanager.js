import { Collection } from "discord.js"
import { readdir } from "fs"
import { join } from "path"

export const CommandManager = class extends Collection{
    constructor(client){
        super()
        this.client = client
    }
    async loadAll(){
        const cmds = await new Promise(resolve => readdir("./commands",(error,result) => resolve(result)))
        return Promise.all(cmds.map(async name => {
            const m = await import(join("../commands",name));
            this.set(m.name,m)
        }))
    }
}
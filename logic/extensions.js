import { Collection } from "discord.js"
import { readdir } from "fs"
import { join } from "path"

export const ExtManager = class ExtManager extends Collection{
    constructor(client){
        super()
        this.client = client
    }
    async loadAll(){
        const all = await new Promise(resolve => readdir("./extensions", (err, files) => resolve(files)))
        const exts = await Promise.all(all.map(x => import(join("../extensions", x, "index.js"))))
        await Promise.allSettled(exts.map(async x => {
            this.set(x.name, x)
            return typeof x.onload === "function" ? new Promise(resolve => resolve(x.onload(this.client))) : false
        }))
        return null;
    }
}
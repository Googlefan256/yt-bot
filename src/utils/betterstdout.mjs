import sleep from "./sleep.mjs"
import {readFileSync} from "fs"
import chalk from "chalk"
const er = readFileSync("./src/utils/error.txt","utf-8")
export default class prog{
    #run = true
    #texts
    #each
    #last
    constructor({each = 100,texts = []} = {}){
        this.#each = each
        this.#texts = texts
        this.#last = Date.now()
    }
    start(){
        this.#run = true
        this.write()
        return this
    }
    async write(){
        this.#last = Date.now()
        const self = this
        if(self.#run === false)return;
        return writes(this.#each,this.#texts)
            .then(()=>self.write())
    }
    async stop(){
        this.#run = false
        await sleep(this.#last + this.#texts.length * this.#each - Date.now() + this.#each)
        process.stdout.write("\n")
        return this
    }
}
async function write(each,text){
    return sleep(each).then(()=>{
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(text);
    })
}
async function writes(each,texts){
    const tx = texts.slice()
    while(tx.length > 0){
        await write(each,tx.shift())
    }
    return
}
const txs = [[".","-","\\","|","/","-"],["",".","..","..."]]
export class loading extends prog{
    constructor({each = 100,text = "",color,texts = [],type = 0} = {}){
        if(!texts[0])texts = txs[type]
        if(color){
            if(typeof color === "function")texts = texts.map(a=>color(a))
            else if(typeof color === "object" && color.length === texts.length){
                color.map((a,b)=>texts[b] = a(texts[b]))
            }
        }
        texts = texts.map(a=>text+a)
        super({each,texts})
    }
}

export const error = function error(content){
    console.log(chalk.red(er) + chalk.blue("\n\nThere was an error running the bot by the following reason: \n\n"+chalk.red(content)))
    console.log()
    process.exit()
}

export const createdDebug = function createdDebug({debugs,errors,commands}){
    const debug = function debug(content){
        if(debugs)console.debug(chalk.yellow("DEBUG: ") + chalk.blue(content))
    }
    debug.error = function error(content){
        if(errors)console.debug(chalk.yellowBright("ERROR: ") + chalk.red(content))
    }
    debug.command = function command(message){
        if(commands)console.debug(chalk.yellow("COMMAND: ") + chalk.cyan(message.author.tag) + chalk.blue(" runned ") + chalk.cyan(message.content))
    }
    debug.queuemenu = function queuemenu(i){
        if(commands)console.debug(chalk.yellow("MENU: ") + chalk.cyan(i.user.tag) + chalk.blue(" pushed ") + chalk.cyan(i.customId))
    }
    return debug;
}
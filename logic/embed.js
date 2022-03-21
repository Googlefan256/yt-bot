import {MessageEmbed} from "discord.js"

export const Embed = class Embed extends MessageEmbed{
    constructor(arg = {}){
        super(Object.assign(arg,{color: process.env.COLOR,footer: {text: "Powered By Googlefan#1009"}}))
    }
}
import { MessageButton } from "discord.js";

export const Button = class Button extends MessageButton{
    constructor(arg = {}){
        super(Object.assign(arg,{style: "LINK"}))
    }
}
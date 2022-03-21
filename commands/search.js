import { Embedlize } from "../logic/search.js";

export const name = "search"

export const raw = {
    name,
    description: "..",
    options: [
        {
            type: "STRING",
            name: "query",
            description: "..",
            required: true
        },
        {
            type: "BOOLEAN",
            name: "hidden",
            description: "..",
            required: false
        }
    ]
}

export const exec = async function(i){
    await i.deferReply({ephemeral:i.options.getBoolean("hidden")})
    return i.editReply(await Embedlize(i.options.getString("query")))
}
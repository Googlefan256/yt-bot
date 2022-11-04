"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const lib_1 = require("../lib");
exports.default = {
    name: "search",
    description: "youtubeから音楽を検索します",
    options: [
        new discord_js_1.SlashCommandStringOption()
            .setName("query")
            .setDescription("検索する文字列を指定します")
            .setRequired(true),
    ],
    async exec(i) {
        await i.deferReply();
        return i.editReply(await (0, lib_1.Embedlize)(i.options.getString("query", true)));
    },
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbedBuilder = void 0;
const discord_js_1 = require("discord.js");
const env_1 = require("../env");
class EmbedBuilder extends discord_js_1.EmbedBuilder {
    constructor(arg = {}) {
        super(Object.assign(arg, {
            color: env_1.env.Color,
            footer: { text: "yt-bot by Googlefan" },
        }));
    }
}
exports.EmbedBuilder = EmbedBuilder;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkButtonBuilder = void 0;
const discord_js_1 = require("discord.js");
class LinkButtonBuilder extends discord_js_1.ButtonBuilder {
    constructor(arg = {}) {
        super(Object.assign(arg, { style: discord_js_1.ButtonStyle.Link }));
    }
}
exports.LinkButtonBuilder = LinkButtonBuilder;

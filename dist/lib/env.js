"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = require("dotenv");
const _1 = require("./");
const discord_js_1 = require("discord.js");
const fs_1 = require("fs");
(0, dotenv_1.config)();
if (!process.env.DISCORD_TOKEN)
    _1.logger.panic("DISCORD_TOKEN is not defined");
const Owners = (process.env.OWNER_ID || "").split(",");
exports.env = {
    Color: (process.env.COLOR || "Green") in discord_js_1.Colors
        ? discord_js_1.Colors[(process.env.COLOR || "Green")]
        : (() => {
            _1.logger.warn("Invalid color, defaulting to Green");
            return discord_js_1.Colors.Green;
        })(),
    DiscordToken: process.env.DISCORD_TOKEN,
    Owners,
    Version: JSON.parse((0, fs_1.readFileSync)("./package.json", "utf-8"))
        .version,
};

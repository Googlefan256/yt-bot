"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveId = exports.Embedlize = exports.search = void 0;
const discord_js_1 = require("discord.js");
const _1 = require("./");
const yt_search_1 = require("yt-search");
const ytdl_core_1 = __importDefault(require("ytdl-core"));
const search = (q) => (0, yt_search_1.search)(q)
    .then((v) => v.videos.slice(0, 5))
    .catch(() => []);
exports.search = search;
const Embedlize = (q) => (0, exports.search)(q).then((results) => {
    if (!results.length)
        return {
            embeds: [
                new _1.EmbedBuilder()
                    .setTitle("エラー")
                    .setDescription("検索結果が見つかりませんでした...\n検索語句を変えて再検索してみてください\n(検索の過度な実行による制限の可能性もあります)"),
            ],
        };
    return {
        embeds: [
            new _1.EmbedBuilder()
                .setTitle("YouTubeの検索結果")
                .setDescription(results
                .map((result) => `[${result.title}](${result.url})\n> ${result.description.replace(/\n/g, "\n> ")}\n[${result.author.name}](${result.author.url})`)
                .join("\n\n"))
                .setThumbnail(results[0].thumbnail),
        ],
        components: [
            new discord_js_1.ActionRowBuilder().addComponents(new _1.LinkButtonBuilder()
                .setURL(`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`)
                .setLabel("もっと見る")
                .setEmoji("🔎")),
        ],
    };
});
exports.Embedlize = Embedlize;
const resolveId = (q) => {
    try {
        return ytdl_core_1.default.getVideoID(q);
    }
    catch {
        return null;
    }
};
exports.resolveId = resolveId;

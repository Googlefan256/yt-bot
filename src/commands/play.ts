import {
	SlashCommandStringOption,
	type TextChannel,
	type VoiceChannel,
} from "discord.js";
import { VideoSearchResult } from "yt-search";
import {
	type Bot,
	type CommandOptions,
	EmbedBuilder,
	Voice,
	search,
	getVideoId,
	getVideoInfo,
} from "../lib";

export default {
	name: "play",
	description: "音楽を再生します",
	options: [
		new SlashCommandStringOption()
			.setName("曲")
			.setDescription("再生する曲のURLまたはキーワード")
			.setRequired(true),
	],
	async exec(i) {
		let player = i.guildId
			? (i.client as Bot).player.get(i.guildId)
			: undefined;
		if (!i.guild?.voiceStates.cache.get(i.user.id)?.channelId) {
			return i.reply({
				embeds: [
					new EmbedBuilder()
						.setTitle("エラー")
						.setDescription("ボイスチャンネルに接続してください。"),
				],
				ephemeral: true,
			});
		}
		if (
			player &&
			player.vchannel.id !==
				i.guild?.voiceStates.cache.get(i.user.id)?.channelId
		) {
			await i.reply({
				embeds: [
					new EmbedBuilder()
						.setTitle("エラー")
						.setDescription("同じボイスチャンネルに接続してください。"),
				],
				ephemeral: true,
			});
			return null;
		}
		if (!player) {
			player = new Voice(
				i.client as Bot,
				i.guild?.voiceStates.cache.get(i.user.id)?.channel as VoiceChannel,
				i.channel as TextChannel
			);
		}
		const query = i.options.getString("曲", true);
		const id = getVideoId(query);
		let r: VideoSearchResult | null;
		if (id) {
			const v = await getVideoInfo(id);
			if (v) {
				r = Object.assign(v, {
					type: "video" as const,
				});
			} else {
				r = null;
			}
		} else {
			r = (await search(query))[0];
		}
		if (!r) {
			return i.reply({
				embeds: [
					new EmbedBuilder()
						.setTitle("エラー")
						.setDescription("曲が見つかりませんでした。"),
				],
				ephemeral: true,
			});
		}
		const res = Object.assign(r, {
			requester: i.user.id,
		});
		if (!res) {
			return i.reply({
				embeds: [
					new EmbedBuilder()
						.setTitle("エラー")
						.setDescription("曲が見つかりませんでした。"),
				],
				ephemeral: true,
			});
		}
		player.add(res, i);
	},
} as CommandOptions;

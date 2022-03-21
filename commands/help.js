import { MessageActionRow, MessageAttachment } from "discord.js"
import { Embed } from "../logic/embed.js"
import { Button } from "../logic/link.js"

import { readFileSync } from "fs"

const {version,dependencies} = JSON.parse(readFileSync("./package.json","utf-8"))

const dep = Object.keys(dependencies).map((v) => `${v}: ${dependencies[v]}`).join("\n")

export const name = "help"

export const raw = {
    name,
    description: ".."
}

export const exec = async function(i){
    return i.reply({embeds:[new Embed().setThumbnail("attachment://youtube.png").setTitle(`このbotについて`).setDescription(`このbotはGooglefan#1009が個人利用を想定して作った音楽再生用のDiscord Botです。\n商用は自分は構いませんがGoogleが多分許しません`).addField(`**使用ライブラリ一覧**`,`\`\`\`\n${dep}\n\`\`\``).addField(`**最後に**`,`ソースコードは以下のリンクから公開されています\nバグなどもGitHubのissueから報告をお願いします！\nあ、コマンドは気合いで把握してください。`).setFooter({text: `バージョン: ${version} | 製作者: Googlefan#1009`})],components:[new MessageActionRow().addComponents(new Button().setLabel("GitHub").setURL("https://github.com/googlefan256/yt-bot"))],files:[new MessageAttachment("./assets/youtube.png","youtube.png")]})
}
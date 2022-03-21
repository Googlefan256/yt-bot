export const name = "拡張機能の名前"

export const description = 
`サンプルの拡張機能です。
descriptionは必須ではないです()`

export const onload = function(client){
    client.once("ready", () => console.log(`${client.user.tag}としてログインしました!`))
}
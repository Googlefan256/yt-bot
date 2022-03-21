import { createAudioPlayer,joinVoiceChannel,VoiceConnectionStatus,createAudioResource,StreamType,AudioPlayerStatus } from "@discordjs/voice"
import ytdl from "ytdl-core"
import { Collection } from "discord.js"
import { EventEmitter } from "events"

export const VoiceManager = class VoiceManager extends Collection{
    constructor(client){
        super()
        this.client = client
    }
}

export const Player = class VoicePlayer extends EventEmitter{
    joined = false
    loopstate = "none"
    _volume = 1
    constructor(client){
        super()
        this.tracks = new Array()
        this.client = client
        this.player = createAudioPlayer()
    }
    async join(VoiceChannel,TextChannel){
        this.TextChannel = TextChannel
        this.guildId = VoiceChannel.guildId
        this.VoiceChannel = VoiceChannel
        this.client.players.set(VoiceChannel.guild.id,this)
        this.connection = joinVoiceChannel({
            channelId: VoiceChannel.id,
            guildId: VoiceChannel.guild.id,
            adapterCreator: VoiceChannel.guild.voiceAdapterCreator,
        })
        this.connection.subscribe(this.player)
        this.connection.once(VoiceConnectionStatus.Disconnected,() => {
            this.emit("kicked")
            this.stop()
        })
        return new Promise(resolve => this.connection.once(VoiceConnectionStatus.Ready,() => {
            this.joined = true;
            return resolve()
        }));
    }
    async _play(id){
        const stream = ytdl(id,{ filter: format => format.audioCodec === "opus" && format.container === "webm",quality: "highest",highWaterMark: 32 * 32 * 32 * 32 * 32 })
        this._playResource(createAudioResource(stream,{ inputType: StreamType.WebmOpus,inlineVolume: true }))
        return this.player._state.resource.volume.volume = this._volume
    }
    async _playResource(resource){
        try{
            return this.player.play(resource)
        }catch{
            return new Promire(resolve => setTimeout(() => resolve(this._playResource(resource)), 2000))
        }
    }
    async add(video){
        if(!this.playing){
            this.now = video
            this.play(video)
            return { video, status: "playing" }
        }
        this.tracks.push(video)
        return { video, status: "queue" }
    }
    async play(video){
        this.playing = true
        this._play(video.videoId)
        this.player.once(AudioPlayerStatus.Idle, () => {
            delete this.now
            if(this.loopstate === "single")this.tracks.unshift(video)
            else if(this.loopstate === "track")this.tracks.push(video)
            if(!this.tracks.length){
                this.playing = false;
                this.emit("end")
                return null;
            }
            const next = this.tracks.shift()
            this.now = next
            this.emit("playing",next)
            return this.play(next)
        })
    }
    async stop(){
        this.client.players.delete(this.VoiceChannel.guild.id)
        this.player.stop()
    }
    async destroy(){
        this.stop()
        this.connection.destroy()
        return null;
    }
    skip(){
        delete this.player._events.idle
        if(this.loopstate === "single")this.tracks.unshift(this.now)
        else if(this.loopstate === "track")this.tracks.push(this.now)
        delete this.now
        this.playing = false
        if(!this.tracks.length){
            this.playing = false;
            this.emit("end")
            return null;
        }
        return this.add(this.tracks.shift())
    }
    set volume(volume){
        this._volume = volume
        this.player._state.resource.volume.volume = volume
    }
    get volume(){
        return this._volume
    }
}
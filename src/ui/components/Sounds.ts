export class Sounds {
    static repeat = {} as egret.Sound
    static end = {} as egret.Sound

    static playing?: egret.SoundChannel
    static playingMusic?: egret.Sound

    static init() {
        this.repeat = RES.getRes('repeat_music')
        this.end = RES.getRes('end_music')
    }

    static play(name: 'repeat' | 'end') {
        const sound = this[name]
        this.playing?.stop()
        this.playing = sound.play()
        this.playingMusic = sound
    }

    static stop(){
        this.playing?.stop()
        this.playingMusic = undefined
    }
}
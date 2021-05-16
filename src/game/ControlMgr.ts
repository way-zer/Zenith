import {Core} from '../entities/Core'
import {TheWorld} from '../ui/TheWorld'
import {config} from '../config'
import {clamp} from '../util'
import {Time} from '../utils/Time'
import TouchEvent = egret.TouchEvent

class ControlMgr {
    private world!: TheWorld
    private downKey = new Map()
    private offset = [0, 0]
    core?: Core


    /**@return boolean any key is down*/
    key(keys: string[]): boolean {
        return keys.some(it => this.downKey.get(it))
    }

    init(world: TheWorld) {
        this.world = world
        world.addEventListener(egret.Event.ENTER_FRAME, this.update, this, undefined, 100)
        document.addEventListener('keydown', (e) => {
            this.downKey.set(e.code, true)
        })
        document.addEventListener('keyup', (e) => {
            this.downKey.delete(e.code)
        })
        document.addEventListener('wheel', this.onWheel.bind(this))
        world.touchEnabled = true
        world.addEventListener(TouchEvent.TOUCH_TAP, this.onTap, this)
    }

    update() {
        const left = this.key(['keyA', 'ArrowLeft']) ? 1 : 0
        const right = this.key(['KeyD', 'ArrowRight']) ? 1 : 0
        const down = this.key(['KeyS', 'ArrowDown']) ? 1 : 0
        const up = this.key(['KeyW', 'ArrowUp']) ? 1 : 0

        this.offset[0] += (right - left) * Time.deltaTime * config.camera.speed
        this.offset[1] += (down - up) * Time.deltaTime * config.camera.speed
        this.world.setCenter((this.core?.display?.x || 0) + this.offset[0], (this.core?.display?.y || 0) + this.offset[1])
    }

    reset(){
        this.core = undefined
        this.offset = [0,0]
    }

    private onWheel(e: WheelEvent) {
        const {minScale, maxScale} = config.camera
        const oldScale = this.world.scaleX
        const newScale = clamp(oldScale * (1 - e.deltaY / 500), minScale, maxScale)
        this.world.scaleX = this.world.scaleY = newScale
    }

    private onTap(e: egret.TouchEvent) {
        this.core?.move?.moveTo(e.localX, e.localY)
    }
}

export default new ControlMgr()
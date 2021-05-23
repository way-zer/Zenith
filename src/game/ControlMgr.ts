import TheWorld from '../ui/TheWorld'
import {config} from '../config'
import {Time} from '../utils/Time'
import EntityMgr from './EntityMgr'
import {clamp} from '../utils/other'
import TouchEvent = egret.TouchEvent

class ControlMgr {
    private downKey = new Map()
    private offset = [0, 0]


    /**@return boolean any key is down*/
    key(keys: string[]): boolean {
        return keys.some(it => this.downKey.get(it))
    }

    init() {
        TheWorld.addEventListener(egret.Event.ENTER_FRAME, this.update, this, undefined, 100)
        document.addEventListener('keydown', (e) => {
            this.downKey.set(e.code, true)
        })
        document.addEventListener('keyup', (e) => {
            this.downKey.delete(e.code)
        })
        document.addEventListener('wheel', ControlMgr.onWheel)
        TheWorld.touchEnabled = true
        TheWorld.addEventListener(TouchEvent.TOUCH_TAP, ControlMgr.onTap, undefined)
    }

    update() {
        const left = this.key(['keyA', 'ArrowLeft']) ? 1 : 0
        const right = this.key(['KeyD', 'ArrowRight']) ? 1 : 0
        const down = this.key(['KeyS', 'ArrowDown']) ? 1 : 0
        const up = this.key(['KeyW', 'ArrowUp']) ? 1 : 0

        this.offset[0] += (right - left) * Time.deltaTime * config.camera.speed
        this.offset[1] += (down - up) * Time.deltaTime * config.camera.speed
        const {x, y} = EntityMgr?.core?.display || {x: 0, y: 0}
        TheWorld.setCenter(x + this.offset[0], y + this.offset[1])
    }

    reset() {
        this.offset = [0, 0]
    }

    private static onWheel(e: WheelEvent) {
        const {minScale, maxScale} = config.camera
        const oldScale = TheWorld.scaleX
        const newScale = clamp(oldScale * (1 - e.deltaY / 500), minScale, maxScale)
        TheWorld.scaleX = TheWorld.scaleY = newScale
    }

    private static onTap(e: egret.TouchEvent) {
        EntityMgr.core?.move?.moveTo(e.localX, e.localY)
        //TODO 增加集体指挥
    }
}

export default new ControlMgr()
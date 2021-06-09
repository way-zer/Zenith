import TheWorld from '../ui/TheWorld'
import {config} from '../config'
import {Time} from '../utils/Time'
import EntityMgr from './EntityMgr'
import {clamp, fixRect} from '../utils/other'
import EntityExtDraw from '../ui/EntityExtDraw'
import {BaseUnit} from '../entities/BaseUnit'
import TouchEvent = egret.TouchEvent

export class ControlMgr {
    private downKey = new Map()
    private offset = [0, 0]
    private selectArea = new egret.Rectangle()
    private selectStart?: number
    private selected = [] as BaseUnit[] //unit may death when use

    /**@return boolean any key is down*/
    key(keys: string[]): boolean {
        return keys.some(it => this.downKey.get(it))
    }

    private validSelect() {
        return (this.selectStart && (Time.now - this.selectStart) > config.camera.minSelectTime)
            && p2.vec2.length([this.selectArea.width, this.selectArea.height]) > config.camera.minSelectDistance
    }

    init() {
        //listen key
        document.addEventListener('keydown', (e) => {
            this.downKey.set(e.code, true)
        })
        document.addEventListener('keyup', (e) => {
            this.downKey.delete(e.code)
        })
        //listen scale
        document.addEventListener('wheel', ControlMgr.onWheel)
        //listen touch
        this.listenTouch()
    }

    update() {
        //TODO 增加相机模式切换键P, 模式1为正常跟随模式 模式2停止跟随 1->2时修正offset 2->1时重置offset
        /// Update Camera
        const left = this.key(['KeyA', 'ArrowLeft']) ? 1 : 0
        const right = this.key(['KeyD', 'ArrowRight']) ? 1 : 0
        const down = this.key(['KeyS', 'ArrowDown']) ? 1 : 0
        const up = this.key(['KeyW', 'ArrowUp']) ? 1 : 0

        this.offset[0] += (right - left) * Time.deltaTime * config.camera.speed
        this.offset[1] += (down - up) * Time.deltaTime * config.camera.speed
        const {x, y} = EntityMgr?.core?.display || {x: 0, y: 0}
        TheWorld.setCenter(x + this.offset[0], y + this.offset[1])
        /// draw select area
        if (this.validSelect()) {
            const g = EntityExtDraw.graphics
            g.lineStyle(1, 0x00ffff)
            const {x, y, height, width} = this.selectArea
            g.drawRect(x, y, width, height)
        }
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

    ///拖动选择
    private listenTouch() {
        TheWorld.touchEnabled = true
        TheWorld.addEventListener(TouchEvent.TOUCH_BEGIN, (e) => {
            if(e.target!=TheWorld)return
            this.selectArea.setTo(e.localX, e.localY, 0, 0)
            this.selectStart = Time.now
        }, undefined)
        TheWorld.addEventListener(TouchEvent.TOUCH_MOVE, (e) => {
            if(e.target!=TheWorld)return
            this.selectArea.right = e.localX
            this.selectArea.bottom = e.localY
        }, undefined)
        let once = true
        const endTouch = () => {
            if (this.validSelect()) {
                this.selected.forEach(it => it.infoDisplay.selected = false)
                this.selected.length = 0
                fixRect(this.selectArea)
                EntityMgr.children.forEach(it => {
                    if (this.selectArea.contains(it.display.x, it.display.y) && it.player.local) {
                        this.selected.push(it)
                        it.infoDisplay.selected = true
                    }
                })
                once = true
            }
            this.selectStart = undefined
            this.selectArea.setEmpty()
        }
        TheWorld.addEventListener(TouchEvent.TOUCH_END, endTouch, undefined)
        TheWorld.addEventListener(TouchEvent.TOUCH_RELEASE_OUTSIDE, endTouch, undefined)
        TheWorld.addEventListener(TouchEvent.TOUCH_TAP, (e) => {
            if(e.target!=TheWorld)return
            if (once) {//忽略拖动的第一次
                once = false
                return
            }
            this.selected.forEach(it => {
                if (it.health > 0) {
                    it.move?.moveTo(e.localX, e.localY)
                }
            })
        }, undefined)
    }
}

export default new ControlMgr()
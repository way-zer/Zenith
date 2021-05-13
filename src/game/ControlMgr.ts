import {Core} from "../entities/Core";
import {TheWorld} from "../ui/TheWorld";
import TouchEvent = egret.TouchEvent;


export class ControlMgr {
    // control!: Phaser.Cameras.Controls.FixedKeyControl;
    core?: Core
    downKey = new Map()

    constructor(public world: TheWorld) {
        this.core = world.entities.addCore()
        world.addEventListener(egret.Event.ENTER_FRAME, this.update, this, undefined, 100)
        document.addEventListener("keydown", (e) => {
            this.downKey.set(e.code, true)
        })
        document.addEventListener("keyup", (e) => {
            this.downKey.delete(e.code)
        })
        document.addEventListener("wheel", this.onWheel.bind(this))
        world.touchEnabled = true
        world.addEventListener(TouchEvent.TOUCH_TAP, this.onTap, this)
        // scene.input.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
        //     this.core?.move.moveTo(scene.input.activePointer.worldX, scene.input.activePointer.worldY)
        // })
    }

    private offset = [0, 0]

    update() {
        const speed = 2

        const left = this.downKey.get("KeyA") || this.downKey.get("ArrowLeft") || 0
        const right = this.downKey.get("KeyD") || this.downKey.get("ArrowRight") || 0
        const up = this.downKey.get("KeyW") || this.downKey.get("ArrowUp") || 0
        const down = this.downKey.get("KeyS") || this.downKey.get("ArrowDown") || 0

        this.offset[0] += (right - left) * TheWorld.deltaTime * speed
        this.offset[1] += (down - up) * TheWorld.deltaTime * speed
        this.world.setCenter((this.core?.display?.x || 0) + this.offset[0], (this.core?.display?.y || 0) + this.offset[1])
    }

    onWheel(e: WheelEvent) {
        const oldScale = this.world.scaleX
        const delta = e.deltaY
        const newScale = Math.min(5, Math.max(0.3, oldScale * (1 - delta / 500)))
        this.world.scaleX = this.world.scaleY = newScale
    }

    onTap(e: egret.TouchEvent) {
        this.core?.move.moveTo(e.localX, e.localY)
    }
}
import DisplayObjectContainer = egret.DisplayObjectContainer
import Bitmap = egret.Bitmap
import BitmapFillMode = egret.BitmapFillMode
import {UnitBody} from '../entities/comp/PhysicBody'
import {Time} from '../utils/Time'
import {config} from '../config'

class TheWorld extends DisplayObjectContainer {
    physics = new p2.World()

    constructor() {
        super();
        this.sortableChildren = true
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this)
    }

    private onAddToStage() {
        this.setBg()
        this.setupWorld()
    }

    private setBg() {
        this.x = this.stage.stageWidth / 2
        this.y = this.stage.stageHeight / 2
        this.width = config.world.width
        this.height = config.world.height
        const bg = new Bitmap()
        bg.texture = RES.getRes('bgGrid')
        bg.fillMode = BitmapFillMode.REPEAT
        bg.width = this.width
        bg.height = this.height
        bg.zIndex = -99
        bg.tint = config.camera.background
        this.addChild(bg)
    }

    private setupWorld() {
        this.physics.sleepMode = p2.World.BODY_SLEEPING
        this.physics.applyGravity = false
        this.physics.applyDamping = false
        this.physics.useFrictionGravityOnZeroGravity = false
        this.physics.useWorldGravityAsFrictionGravity = true
        this.physics.gravity = [0, 0]
        UnitBody.init(this.physics)
    }

    updatePhysics() {
        this.physics.step(Math.min(Time.deltaTime, 100) / 1000)
    }

    setCenter(x: number, y: number) {
        this.anchorOffsetX = x
        this.anchorOffsetY = y
    }
}

export default new TheWorld()
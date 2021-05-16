import DisplayObjectContainer = egret.DisplayObjectContainer
import Bitmap = egret.Bitmap
import BitmapFillMode = egret.BitmapFillMode
import ResourceMgr from '../game/ResourceMgr'
import EntityMgr from '../game/EntityMgr'
import ControlMgr from '../game/ControlMgr'
import {UnitBody} from '../entities/comp/PhysicBody'
import EntityExtDraw from '../game/EntityExtDraw'
import {Time} from '../utils/Time'
import PlayerMgr from '../game/PlayerMgr'

export class TheWorld extends DisplayObjectContainer {
    lastTime = egret.getTimer()
    physics = new p2.World()

    constructor() {
        super()
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.init, this)
    }

    init() {
        this.setBg()
        this.setupWorld()
        PlayerMgr.init()
        ResourceMgr.init(this, -2)
        EntityExtDraw.init(this, -1)
        EntityMgr.init(this, 0)
        ControlMgr.init(this)
        this.addEventListener(egret.Event.ENTER_FRAME, this.update, this);
        (window as any).DEBUG = {
            PlayerMgr, ResourceMgr, EntityMgr,
        }
    }

    private setBg() {
        this.x = this.stage.stageWidth / 2
        this.y = this.stage.stageHeight / 2
        this.width = this.stage.stageWidth * 5
        this.height = this.stage.stageHeight * 5
        const bg = new Bitmap()
        bg.texture = RES.getRes('bgGrid')
        bg.fillMode = BitmapFillMode.REPEAT
        bg.width = this.width
        bg.height = this.height
        bg.zIndex = -3
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

    update() {
        Time.deltaTime = egret.getTimer() - this.lastTime
        this.lastTime = egret.getTimer()
        this.physics.step(Math.min(Time.deltaTime, 100) / 1000)
        EntityExtDraw.preUpdate()

        ControlMgr.update()
        ResourceMgr.update()
        EntityMgr.update()
    }

    setCenter(x: number, y: number) {
        this.anchorOffsetX = x
        this.anchorOffsetY = y
    }
}
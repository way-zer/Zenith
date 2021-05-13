import DisplayObjectContainer = egret.DisplayObjectContainer
import Bitmap = egret.Bitmap
import BitmapFillMode = egret.BitmapFillMode
import {ResourceMgr} from '../game/ResourceMgr'
import {EntityExtDraw} from '../game/EntityExtDraw'
import {EntityMgr} from '../game/EntityMgr'
import {ControlMgr} from '../game/ControlMgr'
import {UnitBody} from '../entities/comp/PhysicBody'

export class TheWorld extends DisplayObjectContainer {
    static deltaTime = 0
    physics = new p2.World()
    resource: ResourceMgr
    entityExtDraw: EntityExtDraw
    entities: EntityMgr
    control: ControlMgr

    $onAddToStage(stage: egret.Stage, nestLevel: number) {
        super.$onAddToStage(stage, nestLevel)
        this.setBg()
        this.setupWorld()
        this.resource = new ResourceMgr(this)
        this.entityExtDraw = new EntityExtDraw(this)
        this.entities = new EntityMgr(this)
        this.control = new ControlMgr(this)
        this.addEventListener(egret.Event.ENTER_FRAME,this.update,this)
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
        this.physics.gravity = [0, 0]
        this.physics.sleepMode = p2.World.BODY_SLEEPING
        UnitBody.init(this.physics)
    }

    lastTime = egret.getTimer()
    update(){
        TheWorld.deltaTime = egret.getTimer() - this.lastTime
        this.lastTime = egret.getTimer()
        this.physics.step(Math.min(TheWorld.deltaTime, 100) / 1000)
        this.entities.update()
    }

    setCenter(x: number, y: number) {
        this.anchorOffsetX = x
        this.anchorOffsetY = y
    }
}
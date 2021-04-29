import DisplayObjectContainer = egret.DisplayObjectContainer;
import Bitmap = egret.Bitmap;
import BitmapFillMode = egret.BitmapFillMode;
import {ResourceMgr} from "../game/ResourceMgr";
import {EntityExtDraw} from "../game/EntityExtDraw";
import {EntityMgr} from "../game/EntityMgr";
import {ControlMgr} from "../game/ControlMgr";
import {UnitBody} from "../entities/BaseUnit";

export class TheWorld extends DisplayObjectContainer {
    static deltaTime = 0
    physics = new p2.World()
    resource: ResourceMgr
    entityExtDraw: EntityExtDraw
    entities: EntityMgr
    control: ControlMgr

    $onAddToStage(stage: egret.Stage, nestLevel: number) {
        super.$onAddToStage(stage, nestLevel);
        let lastTime = egret.getTimer()
        this.addEventListener(egret.Event.ENTER_FRAME, () => {
            TheWorld.deltaTime = egret.getTimer() - lastTime
            lastTime = egret.getTimer()
        }, this, undefined, 100000)
        this.setBg()
        this.setupWorld()
        this.resource = new ResourceMgr(this)
        this.entityExtDraw = new EntityExtDraw(this)
        this.entities = new EntityMgr(this)
        this.control = new ControlMgr(this)
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
        this.addEventListener(egret.Event.ENTER_FRAME, () => {
            this.physics.step(TheWorld.deltaTime / 1000);
        }, this)
        this.physics.on(UnitBody.Event_Impact, (e: { bodyA: p2.Body, bodyB: p2.Body }) => {
            if (e.bodyA instanceof UnitBody)
                e.bodyA.onImpact(e.bodyB)
            else if (e.bodyB instanceof UnitBody)
                e.bodyB.onImpact(e.bodyA)
        })
    }

    setCenter(x: number, y: number) {
        this.anchorOffsetX = x;
        this.anchorOffsetY = y;
    }
}
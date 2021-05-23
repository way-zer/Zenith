import DisplayObjectContainer = egret.DisplayObjectContainer
import ResourceMgr from './game/ResourceMgr'
import EntityMgr from './game/EntityMgr'
import ControlMgr from './game/ControlMgr'
import EntityExtDraw from './ui/EntityExtDraw'
import {Time} from './utils/Time'
import PlayerMgr from './game/PlayerMgr'
import TheWorld from './ui/TheWorld'
import TheUI from './ui/TheUI'
import {TheLoading} from './ui/TheLoading'

export class Main extends DisplayObjectContainer {
    constructor() {
        super()
        this.addEventListener(egret.Event.ADDED_TO_STAGE, async () => {
            this.width = this.stage.stageWidth
            this.height = this.stage.stageHeight
            await this.loadResource()
            this.init()
        }, this)
    }

    async loadResource() {
        try {
            const loadingView = new TheLoading()
            this.stage.addChild(loadingView)
            await RES.loadConfig('resource/default.res.json', 'resource/')
            await RES.loadGroup('preload', 0, loadingView)
            this.stage.removeChild(loadingView)
        } catch (e) {
            console.error(e)
        }
    }

    init() {
        PlayerMgr.init()
        ControlMgr.init()
        //Display
        this.addChild(TheWorld)//bg is -99
        ResourceMgr.init(-2)
        EntityExtDraw.init(-1)
        EntityMgr.init(0)
        this.addChild(TheUI)
        //Finish
        this.addEventListener(egret.Event.ENTER_FRAME, this.update, this);
        (window as any).DEBUG = {
            PlayerMgr, ResourceMgr, EntityMgr,
        }
    }

    private lastTime = egret.getTimer()

    update() {
        Time.deltaTime = egret.getTimer() - this.lastTime
        this.lastTime = egret.getTimer()
        EntityExtDraw.preUpdate()

        TheWorld.updatePhysics()
        ControlMgr.update()
        ResourceMgr.update()
        EntityMgr.update()
        PlayerMgr.update()

        TheUI.update()
    }

    static reset() {
        ResourceMgr.reset()
        EntityMgr.reset()
        ControlMgr.reset()
        PlayerMgr.reset()
    }
}
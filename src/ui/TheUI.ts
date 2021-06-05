import DisplayObjectContainer = egret.DisplayObjectContainer
import UIPackage = fgui.UIPackage
import {StartMenu} from './components/StartMenu'
import {GameHub} from './components/GameHub'
import NetworkMgr from '../game/NetworkMgr'
import {Main} from '../Main'
import Icons from './components/Icons'
import entityMgr from '../game/EntityMgr'
import {Sounds} from './components/Sounds'

class TheUI extends DisplayObjectContainer {
    pkg: UIPackage
    startMenu: StartMenu
    gameHub: GameHub

    constructor() {
        super()
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this)
    }

    private onAddToStage() {
        this.addChild(fgui.GRoot.inst.displayObject)
        this.pkg = UIPackage.addPackage('UI')
        Icons.init()
        this.startMenu = new StartMenu()
        this.gameHub = new GameHub()
    }

    update() {
        this.gameHub.update()
    }

    //Handle Action
    async startGame() {
        Sounds.play('repeat')
        await NetworkMgr.connect()
        this.startMenu.ref.visible = false
        this.gameHub.ref.visible = true
        console.log('start')
    }

    async sendChat(id: string) {
        entityMgr.core?.chat?.send(id)
    }

    async gameOver() {
        this.startMenu.showGameOver()
        await NetworkMgr.disconnect()
        Sounds.stop()
        Main.reset()
    }

    createMsgPopover():fgui.GComponent{
        return fgui.UIPackage.createObject('UI','MsgPopover').asCom
    }
}

export default new TheUI()
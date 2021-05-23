import DisplayObjectContainer = egret.DisplayObjectContainer
import UIPackage = fgui.UIPackage
import {StartMenu} from './components/StartMenu'
import {GameHub} from './components/GameHub'
import NetworkMgr from '../game/NetworkMgr'
import {Main} from '../Main'
import Icons from './components/Icons'
import EntityMgr, {unitMap, UnitType} from '../game/EntityMgr'

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
        await NetworkMgr.connect()
        this.startMenu.ref.visible = false
        this.gameHub.ref.visible = true
        console.log('start')
    }

    async gameOver() {
        this.startMenu.showGameOver()
        await NetworkMgr.disconnect()
        Main.reset()
    }

    createUnit(type: UnitType) {
        EntityMgr.core?.createUnit(type)
        const price = unitMap[type].prototype.baseEnergy
        if (!EntityMgr.core || EntityMgr.core.energy < price) return
        const {x, y} = EntityMgr.core.display
        EntityMgr.addUnit(type, x, y)
    }
}

export default new TheUI()
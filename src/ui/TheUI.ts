import DisplayObjectContainer = egret.DisplayObjectContainer
import UIPackage = fgui.UIPackage
import {TheWorld} from './TheWorld'
import {StartMenu} from './components/StartMenu'
import {GameHub} from './components/GameHub'

export class TheUI extends DisplayObjectContainer {
    startMenu: StartMenu
    gameHub: GameHub

    constructor(private world: TheWorld) {
        super()
        this.addChild(fgui.GRoot.inst.displayObject)
        UIPackage.addPackage('UI')
        this.startMenu = new StartMenu(this)
        this.gameHub = new GameHub(this)
    }

}
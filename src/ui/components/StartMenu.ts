import GRoot = fgui.GRoot
import TheUI from '../TheUI'
import PlayerMgr from '../../game/PlayerMgr'

export class StartMenu {
    ref = fgui.UIPackage.createObject('UI', 'StartMenu').asCom
    btn = this.ref.getChild('btn').asButton
    score = this.ref.getChild('score').asLabel
    controller = this.ref.getController('gameOver')

    constructor() {
        GRoot.inst.addChild(this.ref)
        this.btn.addClickListener(TheUI.startGame, TheUI)
    }

    showGameOver() {
        this.score.text = PlayerMgr.highest.toString()
        this.controller.setSelectedPage('true')
        this.ref.visible = true
    }
}
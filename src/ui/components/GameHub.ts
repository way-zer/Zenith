import {RankList} from './RankList'
import {TheUI} from '../TheUI'
import GRoot = fgui.GRoot
import ControlMgr from '../../game/ControlMgr'

export class GameHub {
    ref = fgui.UIPackage.createObject('UI', 'GameHub').asCom
    score = this.ref.getChild('score').asLabel
    rankList = new RankList(this.ref.getChild('list').asList)
    // miniMap = this.ref.getChild('miniMap').asLoader
    // createBtn = this.ref.getChild('createUnit').asButton

    constructor(private ui: TheUI) {
        this.ref.visible = false
        GRoot.inst.addChild(this.ref)
        // this.createBtn.addClickListener(this.createUnit, this)
    }

    createUnit() {

    }

    update() {
        const score = ControlMgr.core?.energy || 0
        this.score.text = score.toString()
        this.rankList.update([{name: 'Player', score: score}])
    }
}
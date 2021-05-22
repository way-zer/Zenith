import {RankList} from './RankList'
import PlayerMgr from '../../game/PlayerMgr'
import GRoot = fgui.GRoot

export class GameHub {
    ref = fgui.UIPackage.createObject('UI', 'GameHub').asCom
    score = this.ref.getChild('score').asLabel
    rankList = new RankList(this.ref.getChild('list').asList)
    // miniMap = this.ref.getChild('miniMap').asLoader
    // createBtn = this.ref.getChild('createUnit').asButton

    constructor() {
        this.ref.visible = false
        GRoot.inst.addChild(this.ref)
        // this.createBtn.addClickListener(this.createUnit, this)
    }

    createUnit() {

    }

    update() {
        this.score.text = PlayerMgr.local.allEnergy.toString()
        this.rankList.update(Array.from(PlayerMgr.all).map(it => (
            {name: it.name, score: it.allEnergy}
        )))
    }
}
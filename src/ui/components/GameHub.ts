import {RankList} from './RankList'
import PlayerMgr from '../../game/PlayerMgr'
import EntityMgr, {unitMap, UnitType} from '../../game/EntityMgr'

type UnitBtn = { ref: fgui.GButton, type: UnitType }

export class GameHub {
    ref = fgui.UIPackage.createObject('UI', 'GameHub').asCom
    score = this.ref.getChild('score').asLabel
    rankList = new RankList(this.ref.getChild('list').asList)

    // miniMap = this.ref.getChild('miniMap').asLoader

    constructor() {
        this.ref.visible = false
        fgui.GRoot.inst.addChild(this.ref)
        this.bindUnitBtn('createBtn0', 'ProductUnit')
        // this.createBtn.addClickListener(this.createUnit, this)
    }

    unitBtn = [] as UnitBtn[]

    bindUnitBtn(name: string, type: UnitType) {
        const ref = this.ref.getChild(name).asButton
        ref.addClickListener(() => {
            EntityMgr.core?.createUnit(type)
        })
        ref.enabled = false
        this.unitBtn.push({ref, type})
    }

    update() {
        this.unitBtn.forEach(it => {
            it.ref.enabled = unitMap[it.type].prototype.baseEnergy <= (EntityMgr.core?.energy || 0)
        })
        this.score.text = PlayerMgr.local.allEnergy.toString()
        this.rankList.update(Array.from(PlayerMgr.all).map(it => (
            {name: it.name, score: it.allEnergy}
        )))
    }
}
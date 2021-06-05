import {RankList} from './RankList'
import PlayerMgr from '../../game/PlayerMgr'
import {CreateUnitBtn} from './CreateUnitBtn'
import Icons from './Icons'
import entityMgr, {UnitType} from '../../game/EntityMgr'

export class GameHub {
    ref = fgui.UIPackage.createObject('UI', 'GameHub').asCom
    score = this.ref.getChild('score').asLabel
    rankList = new RankList(this.ref.getChild('list').asList)
    createUnitList = this.ref.getChild('createUnitList').asList
    createUnits = [] as CreateUnitBtn[]

    // miniMap = this.ref.getChild('miniMap').asLoader

    constructor() {
        this.ref.visible = false
        fgui.GRoot.inst.addChild(this.ref)
        const callback = (type: UnitType) => {
            entityMgr.core?.createUnit(type)
        }
        this.createUnits.push(new CreateUnitBtn('Z', 'ProductUnit', Icons.warPick, 0x669999, callback))
        this.createUnits.push(new CreateUnitBtn('X', 'WarriorUnit', Icons.swords, 0xFFFF00, callback))
        this.createUnits.push(new CreateUnitBtn('C', 'AnchorUnit', Icons.bow, 0x66CC99, callback))
        // this.createUnits.push(new CreateUnitBtn('V', 'ProductUnit', Icons.warPick, 0xFFFF00, callback))
        this.createUnits.forEach(it => this.createUnitList.addChild(it.obj))
    }

    update() {
        this.createUnits.forEach(it => it.update())
        this.score.text = PlayerMgr.local.allEnergy.toString()
        this.rankList.update(Array.from(PlayerMgr.all).map(it => (
            {name: it.name, score: it.allEnergy}
        )))
    }
}
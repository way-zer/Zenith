import {RankList} from './RankList'
import PlayerMgr from '../../game/PlayerMgr'
import {CreateUnitBtn} from './CreateUnitBtn'
import Icons from './Icons'
import entityMgr, {UnitType} from '../../game/EntityMgr'
import {Chat} from './Chat'
import NetworkMgr from '../../game/NetworkMgr'

export class GameHub {
    ref = fgui.UIPackage.createObject('UI', 'GameHub').asCom
    score = this.ref.getChild('score').asLabel
    endTime = this.ref.getChild('endTime').asLabel
    rankList = new RankList(this.ref.getChild('list').asList)
    createUnitList = this.ref.getChild('createUnitList').asList
    createUnits = [] as CreateUnitBtn[]
    chatMenu = new Chat(this.ref.getChild('chat').asCom)

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
        this.chatMenu.update()
        this.createUnits.forEach(it => it.update())
        this.score.text = Math.floor(PlayerMgr.local.allEnergy).toString()
        const time = NetworkMgr.timeToEnd
        this.endTime.text = Math.floor(time / 60) + ':' + (time % 60)
        this.rankList.update(Array.from(PlayerMgr.all).map(it => (
            {name: it.name, score: Math.floor(it.allEnergy)}
        )))
    }
}
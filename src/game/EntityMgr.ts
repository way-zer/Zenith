import {Core} from '../entities/Core'
import {BaseUnit, BaseUnitSync} from '../entities/BaseUnit'
import TheWorld from '../ui/TheWorld'
import {EventKey} from '../utils/Event'
import NetworkMgr from './NetworkMgr'
import {Player} from '@leancloud/play'
import TheUI from '../ui/TheUI'
import {ProductUnit} from '../entities/ProductUnit'
import {randomPosition} from '../utils/display'

export const unitMap = {
    Core,
    ProductUnit,
}
export type UnitType = keyof typeof unitMap

class EntityMgr extends egret.DisplayObjectContainer {
    static event_addUnit = new EventKey<BaseUnitSync>('addUnit')
    static event_listUnit = new EventKey<{ list: BaseUnitSync[] }>('listUnit')
    static event_death = new EventKey<{ id: string }>('death')
    private static lastId = 0
    children = new Set<BaseUnit>()
    core?: Core

    get nextId() {
        return NetworkMgr.client.userId + '_' + (EntityMgr.lastId++)
    }

    getUnitById(id: string): BaseUnit | null {
        for (let it of this.children) {
            if (it.id == id)
                return it
        }
        return null
    }

    addUnitRandomly(type: UnitType) {
        const {x, y} = randomPosition()
        this.addUnit(type, x, y)
    }

    addUnit(type: UnitType, x: number, y: number) {
        NetworkMgr.send(EntityMgr.event_addUnit, {type, id: this.nextId, x, y})
    }

    addUnitF(info: BaseUnitSync & { sender: Player }) {
        const unit = new unitMap[info.type](info.sender.myInfo)
        unit.fromSync(info)
        TheWorld.physics.addBody(unit.physic)
        this.children.add(unit)
        this.addChild(unit.display)
        if (unit.player.local && unit.type == 'Core') {
            this.core = unit
        }
    }

    onDeath(unit: BaseUnit) {
        NetworkMgr.send(EntityMgr.event_death, {id: unit.display.name})
    }

    onDeathF(info: { id: string, sender: Player }) {
        const unit = this.getUnitById(info.id)
        if (!unit) return
        if (unit == this.core) {
            return TheUI.gameOver().then()
        }
        this.children.delete(unit)
        this.removeChild(unit.display)
        TheWorld.physics.removeBody(unit.physic)
        if (NetworkMgr.isMaster) {
            //TODO 爆资源
        }
    }

    init(layer: number) {
        this.zIndex = layer
        TheWorld.addChild(this)

        this.registerNetwork()
        BaseUnit.registerNetwork()
        Core.registerNetwork()
    }

    update() {
        this.children.forEach(it => it.update())
    }

    reset() {
        this.core = undefined
        this.children.clear()
        this.$children.length = 0
        TheWorld.physics.clear()
    }

    registerNetwork() {
        NetworkMgr.on(EntityMgr.event_addUnit, this.addUnitF.bind(this))
        NetworkMgr.on(NetworkMgr.event_newPlayer, ({sender}) => {
            const list = [] as BaseUnitSync[]
            this.children.forEach(it => {
                if (it.player.local)
                    list.push(it.asSync())
            })
            NetworkMgr.sendPeer(EntityMgr.event_listUnit, {list}, sender)
        })
        NetworkMgr.on(EntityMgr.event_listUnit, ({list, sender}) => {
            list.forEach(it => this.addUnitF(Object.assign({sender}, it)))
        })
        NetworkMgr.on(EntityMgr.event_death, this.onDeathF.bind(this))
    }
}

export default new EntityMgr()
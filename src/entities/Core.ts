import {BaseUnit} from './BaseUnit'
import {UnitBody} from './comp/PhysicBody'
import {Interval} from '../utils/Time'
import {drawPolygonPoints} from '../utils/display'
import EntityMgr, {unitMap, UnitType} from '../game/EntityMgr'
import NetworkMgr from '../game/NetworkMgr'
import {EventKey} from '../utils/Event'
import {Player} from '@leancloud/play'

type CreateUnitSync = {
    id: string, targetId: string, type: UnitType
}

export class Core extends BaseUnit {
    readonly type: 'Core' = 'Core'
    maxEnergy = Infinity
    attackDamage = 10
    attackSpeed = 200

    scale: number = 1
    energyTransfer = new p2.Circle()

    init() {
        super.init()
        this.physic.otherShape.push(this.energyTransfer)
        this.physic.updateShape()
    }

    updateBody() {
        this.scale = 1 + this.energy / 50
        this.radius = 15 * this.scale
        this.energyTransfer.radius = 3 * this.radius
        super.updateBody()
    }

    updateMove() {
        this.speed = 300 / Math.pow(this.energy + 1, 0.3)
        super.updateMove()
    }

    radiusChange() {
        const graphics = this.display.graphics
        graphics.clear()
        graphics.beginFill(0x0099FF)
        graphics.lineStyle(1, 0x66FF99)
        drawPolygonPoints(graphics, 0, 0, 8, 16 * this.scale)
        graphics.endFill()
        graphics.beginFill(this.player.color)
        graphics.lineStyle(1, 0x993300)
        graphics.drawCircle(0, 0, 8 * this.scale)
        graphics.endFill()
        graphics.lineStyle(1, 0xCF61D1, 0.3, undefined, undefined, undefined, undefined, undefined, [4, 5])
        graphics.drawCircle(0, 0, this.energyTransfer.radius)
    }

    attackInterval = new Interval()

    updateAttack(): void {
        if (!this.player.local) return
        this.attackInterval.check(this.attackSpeed, false)
        for (let it of this.physic.mainShape.other) {
            if (it instanceof UnitBody && !it.unit.player.local) {
                this.attackSync(it.unit)
                this.attackInterval.reset()
                return
            }
        }
    }

    attackF(other: BaseUnit) {
        other.healthC.damage(this.attackDamage)
    }

    updateCollect() {
        super.updateCollect()
        for (let it of this.energyTransfer.other) {
            if (it instanceof UnitBody && it.unit.player.local) {
                this.energy += it.unit.energy
                it.unit.energy = 0
            }
        }
    }

    //skill
    static event_skill = new EventKey<CreateUnitSync>('core_createUnit')

    createUnit(type: UnitType) {
        const price = unitMap[type].prototype.baseEnergy
        if (price > this.energy) return
        NetworkMgr.send(Core.event_skill, {id: this.id, targetId: EntityMgr.nextId, type: type})
    }

    createUnitF(sync: CreateUnitSync & { sender: Player }) {
        const price = unitMap[sync.type].prototype.baseEnergy
        if (price > this.energy) return
        this.energy -= price
        EntityMgr.addUnitF({
            id: sync.targetId, type: sync.type, sender: sync.sender,
            x: this.display.x, y: this.display.y,
        })
    }

    static registerNetwork() {
        NetworkMgr.on(Core.event_skill, (sync) => {
            const t = EntityMgr.getUnitById(sync.id)
            if (t && t instanceof Core)
                t.createUnitF(sync)
        })
    }
}
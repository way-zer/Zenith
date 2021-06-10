import {BaseUnit} from './BaseUnit'
import {UnitBody} from './comp/PhysicBody'
import {drawPolygonPoints} from '../utils/display'
import EntityMgr, {unitMap, UnitType} from '../game/EntityMgr'
import {ChatDisplay} from './comp/ChatDisplay'
import {config} from '../config'

export class Core extends BaseUnit {
    readonly type: 'Core' = 'Core'
    energyTransfer = new p2.Circle()
    chat = new ChatDisplay(this)

    maxEnergy = Infinity
    attackSpeed = 300
    energyAsHealthRate = 2
    //dynamic
    attackDamage: number
    scale: number
    radius: number
    speed: number

    energy = config.game.startEnergy

    init() {
        super.init()
        this.physic.otherShape.push(this.energyTransfer)
        this.physic.updateShape()
        this.display.addChild(this.chat)
    }

    updateBody() {
        this.scale = Math.sqrt(this.energy / this.baseEnergy + 1)//sqrt of energy
        this.radius = 15 * this.scale
        this.energyTransfer.radius = 3 * this.radius
        super.updateBody()
    }

    updateMove() {
        //energy->speed : 0->250, 100->200, 900->126
        this.speed = 1000 / Math.pow(this.energy + 100, 0.3)
        super.updateMove()
    }

    /**
     * @override 增加收集范围圈内友军资源的功能
     */
    updateCollect() {
        super.updateCollect()
        if (!this.player.local) return
        for (let it of this.energyTransfer.other.values()) {
            if (it instanceof UnitBody && it.unit.player.local) {
                const unit = it.unit
                this.healthC.pickEnergy(unit.energy)
                unit.healthC.useEnergy(unit.energy)
            }
        }
    }

    protected updateAttack() {
        this.attackDamage = 15 * this.scale
        super.updateAttack()
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

    //skill
    createUnit(type: UnitType) {
        const price = unitMap[type].prototype.baseEnergy
        if (price > this.energy) return
        this.healthC.useEnergy(price)
        EntityMgr.addUnit(type, this.display.x, this.display.y)
    }

    static registerNetwork() {
        ChatDisplay.registerEvents()
    }
}
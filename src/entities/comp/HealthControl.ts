import {BaseUnit} from '../BaseUnit'
import {EventKey} from '../../utils/Event'
import networkMgr from '../../game/NetworkMgr'
import EntityMgr from '../../game/EntityMgr'

export class HealthControl {
    constructor(private readonly unit: BaseUnit) {
    }

    /**捡到资源点*/
    pickEnergy(amount: number) {
        console.assert(this.unit.player.local)
        const healthLoss = this.unit.maxHealth - this.unit.health
        if (healthLoss > 0) {
            const rate = this.unit.energyAsHealthRate
            if (amount * rate > healthLoss) {
                amount -= healthLoss / rate
                this.unit.health = this.unit.maxHealth
            } else {
                this.unit.health += amount * rate
                this.sendSync()
                return
            }
        }
        this.unit.energy = Math.min(this.unit.energy + amount, this.unit.maxEnergy)
        this.sendSync()
    }

    /**收到伤害处理*/
    damage(from: BaseUnit | null, amount: number) {
        console.assert(!from || from.player.local)
        if (this.unit.energy > 0) {
            const rate = this.unit.energyAsHealthRate
            if (amount > this.unit.energy * rate) {
                amount -= this.unit.energy * rate
                this.unit.energy = 0
            } else {
                this.unit.energy -= amount / rate
                this.sendSync()
                return
            }
        }
        this.unit.health -= amount
        this.sendSync()
    }

    useEnergy(amount: number): boolean {
        console.assert(this.unit.player.local)
        if (amount > this.unit.energy) {
            console.warn('unit don\'t have enough energy to use', this.unit, amount)
            return false
        }
        this.unit.energy -= amount
        this.sendSync()
        return true
    }

    sendSync() {
        const {id, health, energy} = this.unit
        networkMgr.send(HealthControl.event_sync, {id, health, energy}, true, true)
    }

    static event_sync = new EventKey<{ id: string, health: number, energy: number }>('health_sync')

    static registerNetwork() {
        networkMgr.on(HealthControl.event_sync, ({id, health, energy}) => {
            const unit = EntityMgr.getUnitById(id)
            if (unit == null) return
            unit.health = health
            unit.energy = energy
        })
    }
}
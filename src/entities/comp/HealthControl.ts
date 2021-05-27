import {BaseUnit} from '../BaseUnit'

export class HealthControl {
    constructor(private readonly unit: BaseUnit) {
    }

    /**捡到资源点*/
    pickEnergy(amount: number) {
        const healthLoss = this.unit.maxHealth - this.unit.health;
        if(healthLoss > 0){
            const rate = this.unit.energyAsHealthRate
            if(amount*rate > healthLoss){
                amount -= healthLoss/rate
                this.unit.health = this.unit.maxHealth
            }else{
                this.unit.health += amount*rate
                return
            }
        }
        this.unit.energy = Math.min(this.unit.energy + amount, this.unit.maxEnergy)
    }

    /**收到伤害处理*/
    damage(amount: number){
        if(this.unit.energy>0){
            const rate = this.unit.energyAsHealthRate
            if(amount > this.unit.energy*rate){
                amount -= this.unit.energy*rate
                this.unit.energy = 0;
            }else{
                this.unit.energy -= amount/rate
                return
            }
        }
        this.unit.health -= amount
    }
}
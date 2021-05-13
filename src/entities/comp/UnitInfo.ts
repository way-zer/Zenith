import {BaseUnit} from '../BaseUnit'
import {clamp} from '../../util'

export class UnitInfo extends egret.Shape{
    constructor(private unit:BaseUnit) {
        super()
    }

    cacheHealth = -1
    update(){
        const health = clamp(this.unit.health/this.unit.maxHealth,0,1)
        if(this.cacheHealth==health)return
        this.cacheHealth = health

        const g = this.graphics
        g.clear()
        g.lineStyle(2,0)
        g.drawRect(-32,-32,64,12)
        g.beginFill(0x00ff00)
        g.drawRect(-30,-30,60*health,8)
        g.endFill()
    }
}
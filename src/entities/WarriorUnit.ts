import {BaseUnit} from './BaseUnit'
import Icons from '../ui/components/Icons'
import {drawUnitGraph, maskIconDisplay} from './common'


export class WarriorUnit extends BaseUnit {
    readonly type: 'WarriorUnit' = 'WarriorUnit'
    iconDisplay = new egret.Bitmap(Icons.swords)

    get baseEnergy(): number {
        return 40
    }

    speed = 300
    radius = 18
    maxHealth = 120
    attackDamage = 10
    attackSpeed = 700
    maxEnergy = 30

    radiusChange() {
        drawUnitGraph.apply(this)
        maskIconDisplay.call(this.iconDisplay, this.radius * 0.5)
    }

    init() {
        super.init()
        this.display.addChild(this.iconDisplay)
    }
}
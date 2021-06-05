import {BaseUnit} from './BaseUnit'
import Icons from '../ui/components/Icons'
import {drawUnitGraph, maskIconDisplay} from './common'

export class ProductUnit extends BaseUnit {
    readonly type: 'ProductUnit' = 'ProductUnit'
    iconDisplay = new egret.Bitmap(Icons.warPick)
    private _collectShape = new p2.Circle()

    get baseEnergy(): number {
        return 30
    }

    maxHealth = 50
    maxEnergy = 30
    radius = 12
    speed = 200
    attackDamage = 5
    attackSpeed = 2000

    /**@override 2倍采集半径*/
    get collectShape(): p2.Circle {
        return this._collectShape
    }

    init() {
        super.init()
        this.physic.otherShape.push(this._collectShape)
        this.physic.updateShape()
        this.display.addChild(this.iconDisplay)
    }

    radiusChange() {
        this._collectShape.radius = this.radius * 2
        const graphics = this.display.graphics
        maskIconDisplay.call(this.iconDisplay, this.radius * 0.5)
        drawUnitGraph.apply(this)
        graphics.lineStyle(1, 0xCF61D1, 0.3, undefined, undefined, undefined, undefined, undefined, [4, 5])
        graphics.drawCircle(0, 0, this._collectShape.radius)
    }
}
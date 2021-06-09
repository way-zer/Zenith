import {BaseUnit} from './BaseUnit'
import Icons from '../ui/components/Icons'
import {drawUnitGraph, maskIconDisplay} from './common'
import Tween = egret.Tween


export class AnchorUnit extends BaseUnit {
    readonly type: 'AnchorUnit' = 'AnchorUnit'
    iconDisplay = new egret.Bitmap(Icons.bow)
    private _attackShape = new p2.Circle()

    get baseEnergy(): number {
        return 40
    }

    speed = 200
    radius = 12
    maxHealth = 80
    attackDamage = 20
    attackSpeed = 2000
    maxEnergy = 30
    bulletSpeed = 1000

    /**@override 3倍攻击距离*/
    get attackShape(): p2.Circle {
        return this._attackShape
    }

    radiusChange() {
        this._attackShape.radius = this.radius * 10
        const graphics = this.display.graphics
        drawUnitGraph.apply(this)
        maskIconDisplay.call(this.iconDisplay, this.radius * 0.5)
        graphics.lineStyle(1, 0xCF61D1, 0.3, undefined, undefined, undefined, undefined, undefined, [4, 5])
        graphics.drawCircle(0, 0, this._attackShape.radius)
    }

    init() {
        super.init()
        this.physic.otherShape.push(this._attackShape)
        this.physic.updateShape()
        this.display.addChild(this.iconDisplay)
    }

    protected attackF(other: BaseUnit) {
        const bulletRadius = 6
        const bullet = new egret.Shape()
        bullet.x = this.display.x
        bullet.y = this.display.y
        bullet.graphics.beginFill(this.player.color)
        bullet.graphics.drawCircle(0, 0, bulletRadius)
        bullet.graphics.endFill()
        this.display.parent.addChild(bullet)
        const dist = () => (p2.vec2.distance([bullet.x, bullet.y], [other.display.x, other.display.y]))
        Tween.get(bullet, {
            onChange: () => {
                if (dist() <= other.physic.mainShape.boundingRadius + bulletRadius + 10) {
                    if (bullet.stage != null) {
                        this.display.parent.removeChild(bullet)
                        super.attackF(other)
                    }
                }
            },
        }).to({
            x: other.display.x,
            y: other.display.y,
        }, dist() / this.bulletSpeed * 1000)
            .call(() => {
                if (bullet.stage != null)
                    this.display.parent.removeChild(bullet)
            })
    }
}
import {randomColor} from '../util'
import {BaseUnit} from './BaseUnit'
import {TheWorld} from '../ui/TheWorld'
import {UnitBody} from './comp/PhysicBody'
import Graphics = egret.Graphics

function drawPolygonPoints(graphics: Graphics, centerX: number, centerY: number, sides: number, radius: number, startAngle: number = Math.PI / 2) {
    const points = []
    let angle = startAngle
    for (let i = 0; i < sides; i++) {
        points.push({x: centerX + radius * Math.cos(angle), y: centerY + radius * Math.sin(angle)})
        angle += 2 * Math.PI / sides
    }
    graphics.moveTo(points[0].x, points[0].y)
    for (let i = sides - 1; i >= 0; i--) {
        graphics.lineTo(points[i].x, points[i].y)
    }
}

export class Core extends BaseUnit<egret.Shape> {
    maxEnergy = Infinity
    attackDamage = 10
    attackSpeed = 200
    createObject(): egret.Shape {
        return new egret.Shape()
    }

    color = randomColor()
    scale: number = 1

    updateBody() {
        this.scale = 1 + this.energy / 50
        this.radius = 15 * this.scale
        super.updateBody()
    }

    updateMove() {
        this.speed = 300 / Math.pow(this.energy + 1, 0.3)
        super.updateMove()
    }

    radiusChange() {
        const graphics = this.display.graphics
        graphics.beginFill(0x0099FF)
        graphics.lineStyle(1, 0x66FF99)
        drawPolygonPoints(graphics, 0, 0, 8, 16 * this.scale)
        graphics.endFill()
        graphics.beginFill(this.color)
        graphics.lineStyle(1, 1, 0x993300)
        graphics.drawCircle(0, 0, 8 * this.scale)
    }

    attackDelta = 0

    updateAttack(): void {
        this.attackDelta += TheWorld.deltaTime
        if (this.attackDelta < this.attackSpeed) return
        for (let it of this.physic.other){
            if(it instanceof UnitBody){
                it.unit.healthC.damage(this.attackDamage)
                this.attackDelta = 0
                return
            }
        }
    }
}
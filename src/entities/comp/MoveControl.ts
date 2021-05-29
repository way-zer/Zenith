import {BaseUnit} from '../BaseUnit'
import EntityExtDraw from '../../ui/EntityExtDraw'
import {displayToP2, p2ToDisplay} from '../../utils/physics'
import {config} from '../../config'
import Point = egret.Point

class Path {
    constructor(public from: egret.Point, public to: egret.Point) {
    }

    get length(): number {
        return egret.Point.distance(this.from, this.to)
    }
}

export class MoveControl {
    constructor(private unit: BaseUnit) {
    }

    private paths: Path[] = []
    private moved = 0

    get pos() {
        return p2ToDisplay(this.unit.physic)
    }

    moveTo(x: number, y: number) {
        if (config.game.singleClickMove) {
            this.paths = []
            this.moved = 0
        }
        const lastPoint = this.paths.length ? this.paths[this.paths.length - 1].to : this.pos
        this.paths.push(new Path(new Point(lastPoint.x, lastPoint.y), new Point(x, y)))
    }

    drawPath() {
        const pos = this.pos
        const graphics = EntityExtDraw.graphics
        graphics.lineStyle(1, 0xff0000)
        graphics.moveTo(pos.x, pos.y)
        for (const next of this.paths) {
            graphics.lineTo(next.to.x, next.to.y)
        }
    }

    private updateNext(delta: number) {
        this.moved = this.paths[0].length - this.moved
        this.paths.shift()
        return this.update(delta, true)
    }

    update(delta: number, recheck: boolean = false): void {
        const body = this.unit.physic
        if (this.paths.length === 0) {
            body.velocity = body.velocity.map((it) => it * 0.2)
            return
        }
        if (this.moved >= this.paths[0].length)
            return this.updateNext(delta)
        this.moved = Math.max(this.moved + this.unit.speed * delta / 1000, 0)
        const now = this.pos
        const direction = this.paths[0].to.subtract(Point.create(now.x, now.y))
        if (p2.vec2.len(body.velocity) < this.unit.speed * 0.1 && false && !recheck)
            return this.updateNext(delta)
        direction.normalize(this.unit.speed)
        p2.vec2.lerp(body.velocity, body.velocity, displayToP2(direction), 0.4)
        this.drawPath()
    }
}

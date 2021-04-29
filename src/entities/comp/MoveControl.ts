import {BaseUnit} from "../BaseUnit";
import {displayToP2, p2ToDisplay} from "../../util";
import {EntityExtDraw} from "../../game/EntityExtDraw";
import Point = egret.Point;

class Path {
    constructor(public from: egret.Point, public to: egret.Point) {
    }

    get length(): number {
        return egret.Point.distance(this.from, this.to)
    }
}

export class MoveControl {
    constructor(private target: BaseUnit, public speed: number = 0) {}

    private paths: Path[] = []
    private moved = 0

    moveTo(x: number, y: number) {
        const lastPoint = this.paths.length ? this.paths[this.paths.length - 1].to : p2ToDisplay(this.target.body)
        this.paths.push(new Path(new Point(lastPoint.x, lastPoint.y), new Point(x, y)))
    }

    drawPath() {
        const pos = p2ToDisplay(this.target.body)
        const graphics = EntityExtDraw.inst.graphics
        graphics.lineStyle(1,0xff0000)
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
        const {body} = this.target
        p2ToDisplay(body,this.target)
        if (this.paths.length === 0) {
            body.velocity = body.velocity.map((it) => it * 0.2);
            return;
        }
        if (this.moved >= this.paths[0].length)
            return this.updateNext(delta)
        this.moved = Math.max(this.moved + this.speed * delta / 1000, 0)
        const now = p2ToDisplay(this.target.body)
        const direction = this.paths[0].to.subtract(Point.create(now.x, now.y))
        if (p2.vec2.len(body.velocity) < this.speed * 0.1 && false && !recheck)
            return this.updateNext(delta);
        direction.normalize(this.speed)
        p2.vec2.lerp(body.velocity, body.velocity, displayToP2(direction), 0.4)
        this.drawPath()
    }
}

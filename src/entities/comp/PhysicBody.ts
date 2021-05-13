import {BaseUnit} from '../BaseUnit'

export class UnitBody extends p2.Body {
    other = new Set<p2.Body>()

    constructor(public unit: BaseUnit, radius?: number) {
        super({mass: 1})
        if (radius !== undefined)
            this.setRadius(radius)
    }

    setRadius(radius: number): boolean {
        if (this.boundingRadius == radius) return false
        this.shapes = [new p2.Circle({radius: radius})]
        this.updateBoundingRadius()
        return true
    }

    static init(world: p2.World) {
        world.on('beginContact', (payload: { bodyA: p2.Body, bodyB: p2.Body }) => {
            if (payload.bodyA instanceof UnitBody) {
                payload.bodyA.other.add(payload.bodyB)
            }
            if (payload.bodyB instanceof UnitBody) {
                payload.bodyB.other.add(payload.bodyA)
            }
        })
        world.on('endContact', (payload: { bodyA: p2.Body, bodyB: p2.Body }) => {
            if (payload.bodyA instanceof UnitBody) {
                payload.bodyA.other.delete(payload.bodyB)
            }
            if (payload.bodyB instanceof UnitBody) {
                payload.bodyB.other.delete(payload.bodyA)
            }
        })
    }
}
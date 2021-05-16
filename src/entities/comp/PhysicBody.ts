import {BaseUnit} from '../BaseUnit'

/**
 * @member shapes specially should have one item
 */
export class UnitBody extends p2.Body {
    other = new Set<p2.Body>()

    constructor(public unit: BaseUnit, radius?: number, public readonly isSensor: boolean = false) {
        super({mass: 1})
        this.gravityScale = 0
        this.damping = 0
        if (radius !== undefined)
            this.setRadius(radius)
    }

    /**@return boolean is radius changed*/
    setRadius(radius: number): boolean {
        if (this.boundingRadius == radius) return false
        this.setShape(new p2.Circle({radius: radius}))
        this.updateBoundingRadius()
        return true
    }

    setShape(shape: p2.Shape) {
        shape.sensor = this.isSensor
        this.shapes = [shape]
        this.updateBoundingRadius()
    }

    static init(world: p2.World) {
        world.on('beginContact', (payload: { bodyA: p2.Body, bodyB: p2.Body }) => {
            function check(main: p2.Body, other: p2.Body) {
                if (main instanceof UnitBody && !(other as UnitBody).isSensor)
                    main.other.add(other)
            }

            check(payload.bodyA, payload.bodyB)
            check(payload.bodyB, payload.bodyA)
        })
        world.on('endContact', (payload: { bodyA: p2.Body, bodyB: p2.Body }) => {
            function check(main: p2.Body, other: p2.Body) {
                if (main instanceof UnitBody) {
                    main.other.delete(other)
                }
            }

            check(payload.bodyA, payload.bodyB)
            check(payload.bodyB, payload.bodyA)
        })
    }
}
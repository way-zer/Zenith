import {BaseUnit} from '../BaseUnit'

type ContactEvent = { bodyA: p2.Body, shapeA: p2.Shape, bodyB: p2.Body, shapeB: p2.Shape }
declare global {
    namespace p2 {
        interface Shape {
            other: Set<p2.Body>
            onlySensor: boolean
        }
    }
}

/**
 * @member shapes specially should have one item
 */
export class UnitBody extends p2.Body {
    mainShape: p2.Shape
    otherShape = [] as p2.Shape[]

    constructor(public unit: BaseUnit, radius?: number) {
        super({mass: 1})
        this.gravityScale = 0
        this.damping = 0
        if (radius !== undefined)
            this.setRadius(radius)
    }

    /**@return boolean is radius changed*/
    setRadius(radius: number): boolean {
        if (this.mainShape?.boundingRadius == radius) return false
        this.mainShape = new p2.Circle({radius: radius})
        this.updateShape()
        return true
    }

    updateShape() {
        this.shapes = [this.mainShape, ...this.otherShape]
        if (!this.mainShape.other)
            this.mainShape.other = new Set<p2.Body>()
        this.otherShape.forEach(it => {
            if (!it.other) {
                it.other = new Set<p2.Body>()
                it.onlySensor = it.sensor = true
            }
        })
    }

    static init(world: p2.World) {
        world.on('beginContact', (payload: ContactEvent) => {
            function check(main: p2.Shape, other: p2.Body, shape: p2.Shape) {
                if (shape.onlySensor) return
                if (main.other)
                    main.other.add(other)
            }

            check(payload.shapeA, payload.bodyB, payload.shapeB)
            check(payload.shapeB, payload.bodyA, payload.shapeA)
        })
        world.on('endContact', (payload: ContactEvent) => {
            function check(main: p2.Shape, other: p2.Body, shape: p2.Shape) {
                if (shape.onlySensor) return
                if (main.other)
                    main.other.delete(other)
            }

            check(payload.shapeA, payload.bodyB, payload.shapeB)
            check(payload.shapeB, payload.bodyA, payload.shapeA)
        })
    }
}
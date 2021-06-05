import {BaseUnit} from '../BaseUnit'
import error = egret.error

type ContactEvent = { bodyA: p2.Body, shapeA: p2.Shape, bodyB: p2.Body, shapeB: p2.Shape }
declare global {
    namespace p2 {
        interface Shape {
            other: Map<p2.Shape, p2.Body>
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
        this.angularDamping = 1
        if (radius !== undefined)
            this.setRadius(radius)
    }

    /**@return boolean is radius changed*/
    setRadius(radius: number): boolean {
        if (this.mainShape?.boundingRadius == radius) return false
        if (!this.mainShape) {
            this.mainShape = new p2.Circle({radius: radius})
            this.updateShape()
        } else if (this.mainShape instanceof p2.Circle)
            this.mainShape.radius = radius
        else error('can\'t use setRadius on not circle main shape')
        return true
    }

    updateShape() {
        this.shapes = [this.mainShape, ...this.otherShape]
        if (!this.mainShape.other)
            this.mainShape.other = new Map()
        this.otherShape.forEach(it => {
            if (!it.other) {
                it.other = new Map()
                it.onlySensor = it.sensor = true
            }
        })
    }

    static init(world: p2.World) {
        world.on('beginContact', ({shapeA, shapeB, bodyA, bodyB}: ContactEvent) => {
            function check(main: p2.Shape, other: p2.Body, shape: p2.Shape) {
                if (shape.onlySensor) return
                if (main.other)
                    main.other.set(shape, other)
            }

            check(shapeA, bodyB, shapeB)
            check(shapeB, bodyA, shapeA)
        })
        world.on('endContact', ({shapeA, shapeB}: ContactEvent) => {
            function check(main: p2.Shape, shape: p2.Shape) {
                if (shape.onlySensor) return
                if (main.other)
                    main.other.delete(shape)
            }

            check(shapeA, shapeB)
            check(shapeB, shapeA)
        })
    }
}
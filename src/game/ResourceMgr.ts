import {displayToP2, randomColor, setRandomPosition} from '../util'
import {TheWorld} from '../ui/TheWorld'
import DisplayObjectContainer = egret.DisplayObjectContainer
import Shape = egret.Shape

export class ResourceMgr extends DisplayObjectContainer {
    constructor(private world: TheWorld) {
        super()
        this.zIndex = -2
        for (let i = 0; i < 50; i++) {
            this.generate()
        }
        world.addChild(this)
    }

    generate() {
        const inst = new Shape()
        inst.graphics.beginFill(randomColor())
        inst.graphics.drawCircle(0, 0, 6)
        inst.graphics.endFill()
        setRandomPosition(this.world, inst)
        const body = new p2.Body()
        body.addShape(new p2.Circle({radius: 6, sensor: true}))
        body.displays = [inst]
        displayToP2(inst, body)
        this.world.physics.addBody(body)
        // this.physicGroup.add(inst)
        this.addChild(inst)
    }

    isRes(body: p2.Body, destroy: boolean = false): boolean {
        if (!body.displays) return false
        const inst = body.displays[0]
        if (inst && this.contains(inst)) {
            if (destroy) {
                this.world.physics.removeBody(body)
                this.removeChild(inst)
            }
            return true
        }
        return false
    }
}
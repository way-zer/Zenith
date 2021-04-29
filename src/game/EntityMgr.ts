import {Core} from "../entities/Core";
import {BaseUnit, UnitBody} from "../entities/BaseUnit";
import {TheWorld} from "../ui/TheWorld";
import {displayToP2, setRandomPosition} from "../util";
import DisplayObject = egret.DisplayObject;

export class EntityMgr extends egret.DisplayObjectContainer {

    constructor(private world: TheWorld) {
        super();
        world.addChild(this)
    }

    addChild(child: BaseUnit): DisplayObject {
        setRandomPosition(this.world, child)
        displayToP2(child, child.body)
        this.world.physics.addBody(child.body)
        child.body.on(UnitBody.Event_Impact, (e: { other: p2.Body }) => {
            this.onPickResource(child, e.other)
        })
        return super.addChild(child);
    }

    addCore(): Core {
        const inst = new Core()
        this.addChild(inst)
        return inst
    }

    onPickResource(unit: BaseUnit, other: p2.Body) {
        if (this.world.resource.isRes(other, true)) {
            unit.info.pickEnergy(50)
        }
    }
}
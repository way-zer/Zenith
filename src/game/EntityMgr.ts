import {Core} from "../entities/Core";
import {BaseUnit} from "../entities/BaseUnit";
import {TheWorld} from "../ui/TheWorld";
import {displayToP2, setRandomPosition} from "../util";
import DisplayObject = egret.DisplayObject;
import {UnitBody} from '../entities/comp/PhysicBody'

export class EntityMgr extends egret.DisplayObjectContainer {
    children = new Set<BaseUnit>()

    constructor(private world: TheWorld) {
        super();
        world.addChild(this)
        BaseUnit.world = world
        for (let i = 0; i < 50; i++) {
            this.addUnit(new Core())
        }
    }

    addUnit(child: BaseUnit): DisplayObject {
        setRandomPosition(this.world, child.display)
        displayToP2(child.display, child.physic)
        this.world.physics.addBody(child.physic)
        this.children.add(child)
        return this.addChild(child.display);
    }

    addCore(): Core {
        const inst = new Core()
        this.addUnit(inst)
        return inst
    }

    onDeath(unit: BaseUnit){
        if(unit!=this.world.control.core){//todo for player death
            this.children.delete(unit)
            this.removeChild(unit.display)
            this.world.physics.removeBody(unit.physic)
        }
    }

    update(){
        this.children.forEach(it=>it.update())
    }
}
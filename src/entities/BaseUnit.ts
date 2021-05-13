import DisplayObject = egret.DisplayObject
import {MoveControl} from './comp/MoveControl'
import {UnitBody} from './comp/PhysicBody'
import {TheWorld} from '../ui/TheWorld'
import {HealthControl} from './comp/HealthControl'
import {UnitInfo} from './comp/UnitInfo'

export abstract class BaseUnit<T extends DisplayObject = DisplayObject> {
    static world: TheWorld
    display: T
    physic: UnitBody = new UnitBody(this)
    move: MoveControl = new MoveControl(this)
    healthC: HealthControl = new HealthControl(this)
    infoDisplay = new UnitInfo(this)

    //may static, or base+ext
    baseEnergy: number = 100 //or price
    maxEnergy: number = 100
    energyAsHealthRate: number = 1
    maxHealth: number = 100
    attackDamage: number = 10
    attackSpeed: number = 1000//interval in millisecond
    speed: number = 10// pixel pre second
    radius: number = 5

    //dynamic
    health: number = this.maxHealth
    energy: number = 0

    abstract createObject(): T

    updateCollect(): void{
        this.physic.other.forEach(it=>{
            if(BaseUnit.world.resource.isRes(it,true)){
                this.healthC.pickEnergy(3)
            }
        })
    }

    /**更新大小,碰撞箱,体积等,必要时可以重绘*/
    updateBody(): void{
        if(this.health <=0)
            BaseUnit.world.entities.onDeath(this)
        this.infoDisplay.update()
        if(this.physic.setRadius(this.radius)){
            this.radiusChange()
        }
    }
    abstract radiusChange(): void

    updateMove(): void{
        this.move.update(TheWorld.deltaTime)
    }

    abstract updateAttack(): void

    constructor() {
        this.display = this.createObject()
        this.init()
    }

    init(): void{
        this.updateBody()
        this.display.$children=[this.infoDisplay]
    }

    update(): void {
        this.updateCollect()
        this.updateBody()
        this.updateMove()
        this.updateAttack()
    }
}
import DisplayObject = egret.DisplayObject
import {MoveControl} from './comp/MoveControl'
import {UnitBody} from './comp/PhysicBody'
import {HealthControl} from './comp/HealthControl'
import {UnitInfo} from './comp/UnitInfo'
import ResourceMgr from '../game/ResourceMgr'
import EntityMgr, {unitMap} from '../game/EntityMgr'
import {Time} from '../utils/Time'
import {displayToP2, p2ToDisplay} from '../util'
import PlayerMgr, {PlayerInfo} from '../game/PlayerMgr'
import {EventKey} from '../utils/Event'
import NetworkMgr from '../game/NetworkMgr'

type UnitSyncId = { id: string }
export type BaseUnitSync = UnitSyncId & {
    type: keyof typeof unitMap,
    x: number,
    y: number,
    health?: number,
    energy?: number,
    velocity?: number[]
}
export type UnitAttackSync = UnitSyncId & {
    targetId: string
}
export type UnitMoveSync = UnitSyncId & {
    position: number[]
    velocity: number[]
}

export abstract class BaseUnit<T extends DisplayObject = DisplayObject> {
    static event_attack = new EventKey<UnitAttackSync>('unitAttack')
    static event_move = new EventKey<UnitMoveSync>('unitMove')
    static event_collect = new EventKey<UnitSyncId>('unitCollect')
    readonly display: T
    abstract readonly type: keyof typeof unitMap
    physic: UnitBody = new UnitBody(this)
    /** null for other player*/
    move: MoveControl | null = null
    healthC: HealthControl = new HealthControl(this)
    infoDisplay: UnitInfo = new UnitInfo(this)

    get id() {
        return this.display.name
    }

    //may static, or calculate base+ext(energy)
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

    private lastHealth = 0

    updateCollect(): void {
        this.physic.other.forEach(it => {
            if (ResourceMgr.isRes(it, true)) {
                NetworkMgr.send(BaseUnit.event_collect, {id: this.id})
            }
        })
    }

    collectF() {
        this.healthC.pickEnergy(3)
    }

    /**更新大小,碰撞箱,体积等,必要时可以重绘*/
    updateBody(): void {
        if (this.health <= 0)
            EntityMgr.onDeath(this)
        this.infoDisplay.update()
        if (this.physic.setRadius(this.radius)) {
            this.radiusChange()
        }
    }

    abstract radiusChange(): void

    //Move
    private lastV: number[] = [0, 0]

    updateMove(): void {
        p2ToDisplay(this.physic, this.display)
        if (this.move) {
            this.move.update(Time.deltaTime)
            const {position, velocity} = this.physic
            if (p2.vec2.distance(velocity, this.lastV) > 0.000001) {
                this.lastV = p2.vec2.clone(velocity)
                NetworkMgr.send(BaseUnit.event_move, {
                    id: this.id, position, velocity,
                }, true)
            }
        }
    }

    moveF(sync: Pick<UnitMoveSync, 'position' | 'velocity'>): void {
        const {position, velocity} = sync
        Object.assign(this.physic, {position, velocity})
    }

    //End Move

    //Attack
    abstract updateAttack(): void

    abstract attackF(other: BaseUnit): void

    attackSync(other: BaseUnit) {
        NetworkMgr.send(BaseUnit.event_attack, {id: this.id, targetId: other.id})
    }

    //End Attack

    constructor(public readonly player: PlayerInfo) {
        if (player == PlayerMgr.local)
            this.move = new MoveControl(this)
        this.display = this.createObject()
        this.display.addEventListener(egret.Event.ADDED_TO_STAGE, this.init, this)
    }

    init(): void {
        this.updateBody()
        this.display.$children = [this.infoDisplay]
    }

    update(): void {
        this.updateCollect()
        this.updateBody()
        this.updateMove()
        this.updateAttack()
    }

    asSync(): BaseUnitSync {
        const {id, type, health, energy, display, physic} = this
        return {id, type, health, energy, x: display.x, y: display.y, velocity: physic.velocity}
    }

    fromSync(sync: BaseUnitSync) {
        const {id, health, energy, x, y, velocity} = sync
        if (health) this.health = health
        if (energy) this.energy = energy
        Object.assign(this.display, {x, y, name: id})
        if (velocity) this.physic.velocity = velocity
        displayToP2(this.display, this.physic)
    }
}
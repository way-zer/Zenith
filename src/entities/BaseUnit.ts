import {MoveControl} from './comp/MoveControl'
import {UnitBody} from './comp/PhysicBody'
import {HealthControl} from './comp/HealthControl'
import {UnitInfo} from './comp/UnitInfo'
import ResourceMgr from '../game/ResourceMgr'
import {Interval, Time} from '../utils/Time'
import {PlayerInfo} from '../game/PlayerMgr'
import {EventKey} from '../utils/Event'
import NetworkMgr from '../game/NetworkMgr'
import {displayToP2, p2ToDisplay} from '../utils/physics'
import EntityMgr, {UnitType} from '../game/EntityMgr'
import {config} from '../config'

type UnitSyncId = { id: string }
export type BaseUnitSync = UnitSyncId & {
    type: UnitType,
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

/**
 * 单位基类
 * 定义了若干单位基础属性,子类可根据需要覆写
 * 定义了4种基础Update
 */
export abstract class BaseUnit {
    static event_attack = new EventKey<UnitAttackSync>('unitAttack')
    static event_move = new EventKey<UnitMoveSync>('unitMove')
    static event_collect = new EventKey<UnitSyncId & { scale: number }>('unitCollect')
    abstract type: UnitType
    readonly display = new egret.Sprite()
    physic: UnitBody = new UnitBody(this, 1)
    /** null for other player*/
    move: MoveControl | null = null
    healthC: HealthControl = new HealthControl(this)
    infoDisplay: UnitInfo = new UnitInfo(this)

    get id() {
        return this.display.name
    }

    get baseEnergy() {
        //Must be const
        return 100
    }

    //may static, or calculate base+ext(energy)
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

    //Collect
    /**采集碰撞箱*/
    get collectShape() {
        return this.physic.mainShape
    }

    /**
     * 更新负责单位的采集功能，
     * @default 接触到{@link attackShape}采集
     */
    protected updateCollect(): void {
        for (const it of this.collectShape.other.values()) {
            if (this.energy < this.maxEnergy) {
                const scale = ResourceMgr.isRes(it, true)
                if (scale)
                    this.collectSync(scale)
            }
        }
    }

    protected collectSync(scale: number) {
        NetworkMgr.send(BaseUnit.event_collect, {id: this.id, scale})
    }

    protected collectF(scale: number) {
        this.healthC.pickEnergy(config.game.resEnergy * scale * scale)
    }

    /**
     * 负责单位本身的逻辑，例血量，体型，大小，贴图等
     * @default 处理单位死亡，更新[infoDisplay]，检查半径
     * @see radiusChange
     */
    updateBody(): void {
        if (this.health <= 0)
            EntityMgr.onDeath(this)
        this.infoDisplay.update()
        if (this.physic.setRadius(this.radius)) {
            this.radiusChange()
        }
    }

    /**当半径变化时，会触发, 此处负责绘制贴图*/
    abstract radiusChange(): void

    //Move
    private lastV: number[] = [0, 0]
    private moveSyncInterval = new Interval()

    /**
     * 更新单位移动
     * @default 调用[this.move]，并在状态变化时发送同步数据
     */
    protected updateMove(): void {
        p2ToDisplay(this.physic, this.display)
        this.display.rotation = 0
        if (this.move) {
            this.move.update(Time.deltaTime)
            const {position, velocity} = this.physic
            if (p2.vec2.distance(velocity, this.lastV) > 1e-9) {
                if (!this.moveSyncInterval.check(100)) return
                this.lastV = p2.vec2.clone(velocity)
                NetworkMgr.send(BaseUnit.event_move, {
                    id: this.id, position, velocity,
                }, true, true)
            }
        }
    }

    protected moveF(sync: Pick<UnitMoveSync, 'position' | 'velocity'>): void {
        const {position, velocity} = sync
        Object.assign(this.physic, {position, velocity})
    }

    //End Move

    //Attack
    protected attackInterval = new Interval()

    /**攻击碰撞箱*/
    get attackShape() {
        return this.physic.mainShape
    }

    /**
     * 更新单位攻击
     * @default 根据{@link attackShape}碰撞攻击
     * 根据{@link attackInterval}控制间隔,调用{@link attackSync}进行攻击
     * 如果需要更改攻击效果,请覆写{@link attackF}
     */
    protected updateAttack(): void {
        if (!this.player.local) return
        if (!this.attackInterval.check(this.attackSpeed)) return
        for (let it of this.attackShape.other.values()) {
            if (it instanceof UnitBody && !it.unit.player.local) {
                this.attackSync(it.unit)
                this.attackInterval.reset()
                return
            }
        }
    }

    protected attackSync(other: BaseUnit) {
        NetworkMgr.send(BaseUnit.event_attack, {id: this.id, targetId: other.id})
    }

    /**
     * @override
     */
    protected attackF(other: BaseUnit): void {
        other.healthC.damage(this.attackDamage)
    }

    //End Attack

    constructor(public readonly player: PlayerInfo) {
        if (player.local)
            this.move = new MoveControl(this)
        this.display.addEventListener(egret.Event.ADDED_TO_STAGE, this.init, this)
    }

    /**初始化,请先调用基类*/
    protected init(): void {
        this.updateBody()
        this.display.addChild(this.infoDisplay)
    }

    /**更新,建议覆写对应功能update*/
    update(): void {
        this.updateCollect()
        this.updateBody()
        this.updateMove()
        this.updateAttack()
    }

    /**同步数据,如果有请增加字段*/
    asSync(): BaseUnitSync {
        const {id, type, health, energy, display, physic} = this
        return {id, type, health, energy, x: display.x, y: display.y, velocity: physic.velocity}
    }

    /**同步数据,如果有请增加字段*/
    fromSync(sync: BaseUnitSync) {
        const {id, health, energy, x, y, velocity} = sync
        if (health) this.health = health
        if (energy) this.energy = energy
        Object.assign(this.display, {x, y, name: id})
        if (velocity) this.physic.velocity = velocity
        displayToP2(this.display, this.physic)
        this.physic.mass = this.player.local ? 1 : Number.MAX_VALUE
        this.physic.updateMassProperties()
    }

    static registerNetwork() {
        NetworkMgr.on(BaseUnit.event_attack, ({id, targetId}) => {
            const target = EntityMgr.getUnitById(targetId)
            if (target == null) return
            EntityMgr.getUnitById(id)?.attackF(target)
        })
        NetworkMgr.on(BaseUnit.event_move, ({id, ...left}) => {
            EntityMgr.getUnitById(id)?.moveF(left)
        })
        NetworkMgr.on(BaseUnit.event_collect, ({id, scale}) => {
            EntityMgr.getUnitById(id)?.collectF(scale)
        })
    }
}
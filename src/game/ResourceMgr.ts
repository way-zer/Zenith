import TheWorld from '../ui/TheWorld'
import {EventKey} from '../utils/Event'
import NetworkMgr from './NetworkMgr'
import {config} from '../config'
import {Interval} from '../utils/Time'
import {Player} from '@leancloud/play'
import {randomColor, randomPosition} from '../utils/display'
import {displayToP2} from '../utils/physics'
import DisplayObjectContainer = egret.DisplayObjectContainer
import Shape = egret.Shape

type ResInfo = { x: number, y: number, id: number, scale: number }
type DestroyInfo = { name: string }

class Res extends Shape implements ResInfo {
    id: number
    physics: p2.Body
    scale: number = 1

    constructor(info: ResInfo) {
        super()
        Object.assign(this, info)
        this.name = 'res_' + info.id
        this.graphics.beginFill(randomColor())
        this.graphics.drawCircle(0, 0, 6 * this.scale)
        this.graphics.endFill()

        const body = new p2.Body()
        body.addShape(new p2.Circle({radius: 6 * this.scale, sensor: true}))
        body.displays = [this]
        displayToP2(this, body)

        this.physics = body
    }
}

export class ResourceMgr extends DisplayObjectContainer {
    static event_generate = new EventKey<ResInfo>('res_generate')
    static event_list = new EventKey<{ list: ResInfo[] }>('res_generate')
    static event_destroy = new EventKey<DestroyInfo>('res_destroy')
    static lastGenerate = 0

    init(layer: number) {
        this.zIndex = layer
        TheWorld.addChild(this)
        NetworkMgr.on(ResourceMgr.event_generate, this.generateF.bind(this))
        NetworkMgr.on(ResourceMgr.event_destroy, this.destroyF.bind(this))
        NetworkMgr.on(NetworkMgr.event_newPlayer, this.list.bind(this))
        NetworkMgr.on(ResourceMgr.event_list, ({list}) => {
            list.forEach(this.generateF.bind(this))
        })
    }

    generateRandom() {
        if (!NetworkMgr.isMaster) throw 'Only Master'
        const {x, y} = randomPosition()
        this.generate(x, y, 1)
    }

    generate(x: number, y: number, scale: number) {
        const info: ResInfo = {
            id: ResourceMgr.lastGenerate++,
            x, y, scale,
        }
        NetworkMgr.send(ResourceMgr.event_generate, info)
    }

    generateF(info: ResInfo) {
        if (!NetworkMgr.isMaster) ResourceMgr.lastGenerate = info.id
        const inst = new Res(info)
        TheWorld.physics.addBody(inst.physics)
        this.addChild(inst)
    }

    list(player: { sender: Player }) {
        if (!NetworkMgr.isMaster) return
        const list = this.$children.map(it => {
            const {x, y, id} = it as Res
            return {x, y, id}
        })
        NetworkMgr.sendPeer(ResourceMgr.event_list, {list}, player.sender)
    }

    /**
     * @param body 需要判断的物理实体
     * @param destroy 是否立刻销毁
     * @return 0 如果否,否则返回scale
     */
    isRes(body: p2.Body, destroy: boolean = false): number {
        if (!body.displays) return 0
        const inst = body.displays[0]
        if (inst instanceof Res && this.contains(inst)) {
            if (destroy) {
                NetworkMgr.send(ResourceMgr.event_destroy, {name: inst.name})
            }
            return inst.scale
        }
        return 0
    }

    destroyF(info: DestroyInfo) {
        const inst = this.getChildByName(info.name)
        if (inst) {
            TheWorld.physics.removeBody((inst as Res).physics)
            this.removeChild(inst)
        }
    }

    private interval = new Interval()

    update() {
        if (NetworkMgr.isMaster && this.interval.check(config.game.resourceGenInterval)) {
            if (this.numChildren < config.game.resourceGenMax) {
                this.generateRandom()
            }
        }
    }

    reset() {
        this.$children.length = 0
    }
}

export default new ResourceMgr()
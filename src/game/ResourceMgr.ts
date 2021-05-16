import {displayToP2, randomColor} from '../util'
import {TheWorld} from '../ui/TheWorld'
import {EventKey} from '../utils/Event'
import NetworkMgr from './NetworkMgr'
import {config} from '../config'
import {Interval} from '../utils/Time'
import {Player} from '@leancloud/play'
import DisplayObjectContainer = egret.DisplayObjectContainer
import Shape = egret.Shape

type ResInfo = { x: number, y: number, id: number }
type DestroyInfo = { name: string }

class Res extends Shape implements ResInfo {
    id: number
    physics: p2.Body

    constructor(info: ResInfo) {
        super()
        this.graphics.beginFill(randomColor())
        this.graphics.drawCircle(0, 0, 6)
        this.graphics.endFill()
        Object.assign(this, info)
        this.name = 'res_' + info.id

        const body = new p2.Body()
        body.addShape(new p2.Circle({radius: 6, sensor: true}))
        body.displays = [this]
        displayToP2(this, body)

        this.physics = body
    }
}

class ResourceMgr extends DisplayObjectContainer {
    static event_generate = new EventKey<ResInfo>('res_generate')
    static event_list = new EventKey<{ list: ResInfo[] }>('res_generate')
    static event_destroy = new EventKey<DestroyInfo>('res_destroy')
    static lastGenerate = 0
    world!: TheWorld

    init(world: TheWorld, layer: number) {
        this.world = world
        this.zIndex = layer
        world.addChild(this)
        NetworkMgr.on(ResourceMgr.event_generate, this.generateF.bind(this))
        NetworkMgr.on(ResourceMgr.event_destroy, this.destroyF.bind(this))
        NetworkMgr.on(NetworkMgr.event_newPlayer, this.list.bind(this))
        NetworkMgr.on(ResourceMgr.event_list, ({list})=>{
            list.forEach(this.generateF.bind(this))
        })
    }

    generate() {
        if (!NetworkMgr.isMaster) throw 'Only Master'
        const info: ResInfo = {
            x: Math.random() * config.world.width,
            y: Math.random() * config.world.height,
            id: ResourceMgr.lastGenerate++,
        }
        NetworkMgr.send(ResourceMgr.event_generate, info)
    }

    generateF(info: ResInfo) {
        if (!NetworkMgr.isMaster) ResourceMgr.lastGenerate = info.id
        const inst = new Res(info)
        this.world.physics.addBody(inst.physics)
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

    isRes(body: p2.Body, destroy: boolean = false): boolean {
        if (!body.displays) return false
        const inst = body.displays[0]
        if (inst && this.contains(inst)) {
            if (destroy) {
                NetworkMgr.send(ResourceMgr.event_destroy, {name: inst.name})
            }
            return true
        }
        return false
    }

    destroyF(info: DestroyInfo) {
        const inst = this.getChildByName(info.name)
        if (inst) {
            this.world.physics.removeBody((inst as Res).physics)
            this.removeChild(inst)
        }
    }

    private interval = new Interval()

    update() {
        if (NetworkMgr.isMaster && this.interval.check(config.game.resourceGenInterval)) {
            if (this.numChildren < config.game.resourceGenMax) {
                this.generate()
            }
        }
    }

    reset() {
        this.$children.length = 0
    }
}

export default new ResourceMgr()
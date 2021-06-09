import {Client, Event, Player, ReceiverGroup} from '@leancloud/play'
import {config} from '../config'
import {EventKey, MyEventEmitter} from '../utils/Event'
import EntityMgr from './EntityMgr'
import {Main} from '../Main'

/**
 * 依赖LeanCloud提供的多人对战SDK，负责游戏的网络通信
 * @implements MyEventEmitter 在房间范围广播事件
 */
export class NetworkMgr extends MyEventEmitter<{ sender: Player }> {
    /**成功加入房间*/
    event_joined = new EventKey('joined')
    /**有其他玩家加入房间*/
    event_newPlayer = new EventKey('newPlayer')
    /**其他玩家退出房间*/
    event_quitPlayer = new EventKey('quitPlayer')
    /**用于批量传包*/
    event_batch = new EventKey<{ list: { event: number, data: any }[] }>('batch')
    /**leanCloud的客户端实例*/
    client: Client
    /**当前网络状态*/
    state: 'unConnect' | 'connecting' | 'reconnect' | 'gaming' = 'unConnect'
    /** endTime in second */
    endTime: number = Number.MAX_VALUE
    batchEvents = [] as { event: number, data: any }[]

    constructor() {
        super()
        const {appId, appKey, server} = config.network
        this.client = new Client({
            appId, appKey, playServer: server,
            userId: 'Player_' + Math.floor(Math.random() * 99999),
            gameVersion: config.version,
        })
        this.listen()
    }

    /**@return 距离结束的时间,单位s */
    get timeToEnd(): number {
        return Math.round(this.endTime - Date.now() / 1000)
    }

    /**
     * 连接到服务器,加入随机房间
     * @throws any 如果网络连接中出现任何问题
     */
    async connect() {
        if (this.state == 'connecting') return
        this.batchEvents.length = 0
        this.state = 'connecting'
        await this.client.connect()
        try {
            await this.client.joinRandomRoom()
            this.endTime = this.client.room.customProperties.endTime
        } catch (e) {
            const {code} = e
            if (code == 4301) {
                this.client.once(Event.ROOM_CUSTOM_PROPERTIES_CHANGED,()=>{
                    this.endTime = this.client.room.customProperties.endTime
                })
                await this.client.createRoom()
                const endTime = Math.round(Date.now() / 1000 + config.game.time)
                await this.client.room.setCustomProperties({endTime})
            } else throw e
        }
        this.emit(this.event_joined, {sender: this.client.player})
        EntityMgr.addUnitRandomly('Core')
        this.state = 'gaming'
    }

    /**
     * 断开连接
     */
    async disconnect() {
        this.state = 'unConnect'
        await this.client.close()
        this.batchEvents.length = 0
    }

    private listen() {
        this.client.on(Event.PLAYER_ROOM_JOINED, ({newPlayer}) => {
            if (newPlayer == this.client.player) return
            this.emit(this.event_newPlayer, {sender: newPlayer})
        })
        this.client.on(Event.PLAYER_ROOM_LEFT, ({leftPlayer}) => {
            this.emit(this.event_quitPlayer, {sender: leftPlayer})
        })
        this.client.on(Event.DISCONNECTED, async () => {//PLAYER_ACTIVITY_CHANGED PLAYER_ROOM_LEFT
            console.log('disconnect')
            if (this.state != 'gaming') return
            Main.reset()
            await this.client.reconnectAndRejoin()
            //TODO 重连信息保存
            this.state = 'reconnect'
            this.emit(this.event_joined, {sender: this.client.player})
            setTimeout(() => {
                if (EntityMgr.core == null)
                    EntityMgr.addUnitRandomly('Core')
                this.state = 'gaming'
            }, 3000)
        })
        this.client.on(Event.CUSTOM_EVENT, ({eventId, eventData, senderId}) => {
            const key = EventKey.getById(eventId)
            if (!key) {
                console.log('event (id:' + eventId + ') not support: ', eventData)
                return
            }
            const sender = this.client.room.getPlayer(senderId)
            this.emit(key, Object.assign({sender}, eventData))
        })
        this.on(this.event_batch, ({list, sender}) => {
            list.forEach(({event: eventId, data}) => {
                const key = EventKey.getById(eventId)
                if (!key) {
                    console.log('event (id:' + eventId + ') not support: ', data)
                    return
                }
                this.emit(key, Object.assign({sender}, data))
            })
        })
    }

    /**
     * 是否是Master,一个房间内仅存在一位master
     */
    get isMaster(): boolean {
        return this.client.room && this.client.player?.isMaster
    }

    private send0<T>(event: EventKey<T>, arg: T, options: { receiverGroup?: ReceiverGroup; targetActorIds?: number[]; }) {
        this.client.sendEvent(event.id, arg, options).then()
    }

    /**
     * 向特定玩家发送事件
     * @param event 事件类型
     * @param arg 事件内容
     * @param peer 目标玩家
     */
    sendPeer<T>(event: EventKey<T>, arg: T, peer: Player) {
        this.send0(event, arg, {targetActorIds: [peer.actorId]})
    }

    /**
     * 在房间内广播事件
     * @param event 事件类型
     * @param arg 事件内容
     * @param batch 是否允许批量发包
     * @param excludeSelf 排除自己接收事件
     */
    send<T>(event: EventKey<T>, arg: T, batch: boolean = false, excludeSelf: boolean = false) {
        if (batch)
            this.batchEvents.push({event: event.id, data: arg})
        else
            this.send0(event, arg, {receiverGroup: ReceiverGroup.Others})
        if (!excludeSelf)
            this.emit(event, Object.assign({sender: this.client.player}, arg))
    }

    batchSend() {
        if (this.batchEvents.length) {
            const list = this.batchEvents.splice(0, 10)
            this.send(this.event_batch, {list}, false, true)
        }
    }
}

export default new NetworkMgr()
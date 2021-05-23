import {Client, Event, Player, ReceiverGroup} from '@leancloud/play'
import {config} from '../config'
import {EventKey, MyEventEmitter} from '../utils/Event'
import EntityMgr from './EntityMgr'
import {Main} from '../Main'

/**@implements MyEventEmitter broadcast event in room*/
class NetworkMgr extends MyEventEmitter<{ sender: Player }> {
    event_joined = new EventKey('joined')
    event_newPlayer = new EventKey('newPlayer')
    event_quitPlayer = new EventKey('quitPlayer')//quit
    client: Client
    state: 'unConnect' | 'connecting' | 'reconnect' | 'gaming' = 'unConnect'

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

    async connect() {
        await this.client.connect()
        try {
            await this.client.joinRandomRoom()
        } catch (e) {
            const {code} = e
            if (code == 4301)
                await this.client.createRoom({
                    //TODO customRoom
                })
            else throw e
        }
        this.state = 'connecting'
        this.emit(this.event_joined, {sender: this.client.player})
        EntityMgr.addUnitRandomly('Core')
        this.state = 'gaming'
    }

    async disconnect() {
        this.state = 'unConnect'
        await this.client.close()
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
    }

    get isMaster(): boolean {
        return this.client.room && this.client.player?.isMaster
    }

    private send0<T>(event: EventKey<T>, arg: T, options: { receiverGroup?: ReceiverGroup; targetActorIds?: number[]; }) {
        this.client.sendEvent(event.id, arg, options).then()
    }

    sendPeer<T>(event: EventKey<T>, arg: T, peer: Player) {
        this.send0(event, arg, {targetActorIds: [peer.actorId]})
    }

    send<T>(event: EventKey<T>, arg: T, excludeSelf: boolean = false) {
        this.send0(event, arg, {receiverGroup: ReceiverGroup.Others})
        if (!excludeSelf)
            this.emit(event, Object.assign({sender: this.client.player}, arg))
    }
}

export default new NetworkMgr()
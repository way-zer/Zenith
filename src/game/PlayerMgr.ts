import NetworkMgr from './NetworkMgr'
import {EventKey} from '../utils/Event'
import EntityMgr, {UnitType} from './EntityMgr'
import {randomColor} from '../utils/display'

declare module '@leancloud/play' {
    interface Player {
        myInfo: PlayerInfo
    }
}

type UnitMap = {
    [key in UnitType]: number
}

type PlayerInfoSync = {
    name: string,
    color: number,
}

export class PlayerInfo implements PlayerInfoSync {
    name = 'Player#' + Math.floor(Math.random() * 99999)
    color = randomColor()
    allEnergy = 0
    units = {} as UnitMap
    local = false
    lastPacketId = 0

    reset() {
        this.allEnergy = 0
        this.units = {} as UnitMap
    }

    asSync(): PlayerInfoSync {
        const {name, color} = this
        return {name, color}
    }

    static fromSync(sync: PlayerInfoSync) {
        const {name, color} = sync
        return Object.assign(new PlayerInfo(), {name, color})
    }
}

export class PlayerMgr {
    static event_info = new EventKey<PlayerInfoSync>('player_info')
    highest = 0
    local = new PlayerInfo()
    all = new Set<PlayerInfo>()

    init() {
        this.reset()
        NetworkMgr.on(NetworkMgr.event_joined, ({sender}) => {
            sender.myInfo = this.local
            NetworkMgr.send(PlayerMgr.event_info, this.local.asSync(), false, true)
        })
        NetworkMgr.on(NetworkMgr.event_newPlayer, ({sender}) => {
            NetworkMgr.sendPeer(PlayerMgr.event_info, this.local.asSync(), sender)
        })
        NetworkMgr.on(PlayerMgr.event_info, ({sender, ...body}) => {
            // if (sender.isMaster && this.local.name == body.name) {//重连覆盖
            //     this.local.allEnergy = body.allEnergy
            //     this.local.units = body.units
            // } else {
            const v = PlayerInfo.fromSync(body)
            sender.myInfo = v
            this.all.add(v)
            // }
        })
        NetworkMgr.on(NetworkMgr.event_quitPlayer, ({sender}) => {
            this.all.delete(sender.myInfo)
        })
    }

    update() {
        this.all.forEach(it => it.reset())
        EntityMgr.children.forEach(it => {
            it.player.allEnergy += it.baseEnergy
            if (it.type == 'Core')
                it.player.allEnergy += it.energy
            it.player.units[it.type]++
        })
        this.highest = Math.max(this.highest, this.local.allEnergy)
    }

    reset() {
        this.highest = 0
        this.local.reset()
        this.local.local = true
        this.all.clear()
        this.all.add(this.local)
    }
}

export default new PlayerMgr()
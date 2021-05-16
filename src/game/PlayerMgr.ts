import {Player as NetPlayer} from '@leancloud/play'
import EntityMgr from './EntityMgr'
import ControlMgr from './ControlMgr'
import ResourceMgr from './ResourceMgr'
import {randomColor} from '../util'
import NetworkMgr from './NetworkMgr'
import {EventKey} from '../utils/Event'

declare module '@leancloud/play' {
    interface Player {
        myInfo: PlayerInfo
    }
}

type PlayerInfoSync = {
    name: string,
    color: number,
    allEnergy: number,
    units: {
        [key: string]: number
    }
}

export class PlayerInfo implements PlayerInfoSync {
    name = 'Player#' + Math.floor(Math.random() * 99999)
    color = randomColor()
    allEnergy = 0
    units = {}
    netPlayer?: NetPlayer

    reset() {
        this.allEnergy = 0
        this.units = {}
        this.netPlayer = undefined
    }

    asSync(): PlayerInfoSync {
        const {name, color, allEnergy, units} = this
        return {name, color, allEnergy, units}
    }

    static fromSync(sync: PlayerInfoSync) {
        const {name, color, allEnergy, units} = sync
        return Object.assign(new PlayerInfo(), {name, color, allEnergy, units})
    }
}

class PlayerMgr {
    static event_info = new EventKey<PlayerInfoSync>('player_info')
    local = new PlayerInfo()
    other = new Set<PlayerInfo>()

    init() {
        NetworkMgr.on(NetworkMgr.event_joined, ({sender}) => {
            sender.myInfo = this.local
            this.local.netPlayer = sender
            NetworkMgr.send(PlayerMgr.event_info, this.local.asSync(), true)
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
            v.netPlayer = sender
            sender.myInfo = v
            this.other.add(v)
            // }
        })
    }

    reset() {
        this.other.clear()
    }
}

export default new PlayerMgr()
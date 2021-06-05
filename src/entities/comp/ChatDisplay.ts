import {BaseUnit} from '../BaseUnit'
import {EventKey} from '../../utils/Event'
import {Chat} from '../../ui/components/Chat'
import NetworkMgr from '../../game/NetworkMgr'
import entityMgr from '../../game/EntityMgr'
import {Core} from '../Core'
import TheUI from '../../ui/TheUI'
import Tween = egret.Tween

function center(this: egret.DisplayObject) {
    this.anchorOffsetX = this.width / 2
    this.anchorOffsetY = this.height / 2
}

export class ChatDisplay extends egret.DisplayObjectContainer {
    static event_send = new EventKey<{ coreId: string, msg: string }>('sendEmoji')
    ref = TheUI.createMsgPopover()
    icon = this.ref.getChild('icon').asLoader

    constructor(private unit: BaseUnit) {
        super()
        this.alpha = 0
        this.addChild(this.ref.displayObject)
        this.y = -(this.height*0.6+40)
        this.x = -(this.width*0.2*0.6)
        this.scaleX = this.scaleY = 0.6
        // this.x = -30
        // this.x = 30
    }

    $onRemoveFromStage() {
        super.$onRemoveFromStage()
        this.ref.dispose()
    }

    send(id: string) {
        NetworkMgr.send(ChatDisplay.event_send, {coreId: this.unit.id, msg: id})
    }

    sendF(id: string) {
        const info = Chat.map.get(id)
        if (!info) return
        this.tint = info.color
        this.icon.texture = info.icon
        Tween.removeTweens(this)
        Tween.get(this)
            .set({alpha: 0})
            .to({alpha: 1}, 200)
            .wait(5000)
            .to({alpha: 0}, 200)
    }

    static registerEvents() {
        NetworkMgr.on(ChatDisplay.event_send, ({msg, coreId}) => {
            const core = entityMgr.getUnitById(coreId)
            if (core && core instanceof Core)
                core.chat.sendF(msg)
        })
    }
}
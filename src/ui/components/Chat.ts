import TheUI from '../TheUI'
import ControlMgr from '../../game/ControlMgr'

type Btn = {
    ref: fgui.GButton,
    icon: egret.Texture,
    color: number
}

type ChatEmoji = { color: number, icon: egret.Texture }

export class Chat {
    static map = new Map<string, ChatEmoji>()
    buttons = [] as Btn[]

    constructor(private ref: fgui.GComponent) {
        ref._children.forEach(it => {
            if (it instanceof fgui.GButton) {
                const id = it.name
                Chat.map.set(id, {
                    color: it.getChild('fg').asGraph.color,
                    icon: it.getChild('icon').asImage.texture,
                })
                it.addClickListener(() => {
                    TheUI.sendChat(id).then()
                })
            }
        })
    }

    update() {
        this.ref.visible = ControlMgr.key(['KeyQ'])
    }
}
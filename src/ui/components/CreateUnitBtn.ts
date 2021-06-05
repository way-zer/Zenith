import ControlMgr from '../../game/ControlMgr'
import {entityMgr, UnitType} from '../../game/EntityMgr'

export class CreateUnitBtn {
    obj = fgui.UIPackage.createObjectFromURL('ui://UI/Button_CreateIcon').asButton

    constructor(public key: string, public type: UnitType, icon: egret.Texture, color: number, public callback: (type: UnitType) => void) {
        this.obj.getChild('key').asTextField.text = key
        this.obj.getChild('icon').asImage.texture = icon
        this.obj.getChild('fg').asGraph.color = color
        this.obj.addClickListener(() => {
            this.callback(this.type)
        })
        this.obj.enabled = false
    }

    pressed = false

    update() {
        const price = entityMgr.price(this.type)
        this.obj.getChild('price').asTextField.text = price.toString()
        this.obj.enabled = price <= (entityMgr.core?.energy || 0)

        if (ControlMgr.key(['key' + this.key])) {
            if (!this.pressed)
                this.callback(this.type)
            this.pressed = true
        } else this.pressed = false
    }
}
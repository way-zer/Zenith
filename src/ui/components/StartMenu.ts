import {TheUI} from '../TheUI'
import GRoot = fgui.GRoot

export class StartMenu{
    ref = fgui.UIPackage.createObject("UI", "StartMenu").asCom
    btn = this.ref.getChild("btn").asButton

    constructor(private ui: TheUI) {
        GRoot.inst.addChild(this.ref)
        this.btn.addClickListener(this.onStart, this)
    }

    onStart() {
        // this.btn.enabled = false
        this.ref.visible = false
        this.ui.gameHub.ref.visible = true
        console.log("start")
    }
}
import {MainMenu} from "./MainMenu";

export class DemoEntry {

    private _closeButton: fgui.GObject;
    private _currentDemo: any;

    constructor() {
        fgui.UIPackage.addPackage("MainMenu");

        fgui.GRoot.inst.addEventListener("start_demo", this.onDemoStart, this);
        this._currentDemo = new MainMenu();
    }

    onDemoStart(evt:egret.Event) {
        this._currentDemo = evt.data;
        this._closeButton = fgui.UIPackage.createObject("MainMenu", "CloseButton");
        this._closeButton.setXY(fgui.GRoot.inst.width - this._closeButton.width - 10, fgui.GRoot.inst.height - this._closeButton.height - 10);
        this._closeButton.addRelation(fgui.GRoot.inst, fgui.RelationType.Right_Right);
        this._closeButton.addRelation(fgui.GRoot.inst, fgui.RelationType.Bottom_Bottom);
        this._closeButton.sortingOrder = 100000;
        this._closeButton.addClickListener(this.onDemoClosed, this);
        fgui.GRoot.inst.addChild(this._closeButton);
    }

    onDemoClosed() {
        if(this._currentDemo.destroy)
            this._currentDemo.destroy();
        fgui.GRoot.inst.removeChildren(0, -1, true);

        this._currentDemo = new MainMenu();
    }
}

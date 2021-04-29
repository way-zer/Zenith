import DisplayObjectContainer = egret.DisplayObjectContainer;
import {TheWorld} from "./TheWorld";
import {DemoEntry} from "./fgui/DemoEntry";

export class TheUI extends DisplayObjectContainer {
    constructor(private world: TheWorld) {
        super();
        this.addChild(fgui.GRoot.inst.displayObject);
        new DemoEntry();
    }
}
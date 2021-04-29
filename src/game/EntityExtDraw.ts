/**
 * 用于绘制路径等实体辅助相关内容
 * 显示层级在单位层下方
 */
import {TheWorld} from "../ui/TheWorld";
import Shape = egret.Shape;

export class EntityExtDraw extends Shape {
    static inst: EntityExtDraw;
    constructor(world: TheWorld) {
        super();
        this.zIndex = -1
        world.addChild(this)
        this.addEventListener(egret.Event.ENTER_FRAME,this.preUpdate,this,false,1000)
        EntityExtDraw.inst = this
    }
    preUpdate(){
        this.graphics.clear()
    }
}

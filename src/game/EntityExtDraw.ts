/**
 * 用于绘制路径等实体辅助相关内容
 * 显示层级在单位层下方
 */
import {TheWorld} from '../ui/TheWorld'

class EntityExtDraw extends egret.Shape {
    init(world: TheWorld, layer: number) {
        this.zIndex = layer
        world.addChild(this)
    }

    preUpdate() {
        this.graphics.clear()
    }
}

export default new EntityExtDraw()

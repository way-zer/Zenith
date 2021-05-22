/**
 * 用于绘制路径等实体辅助相关内容
 * 显示层级在单位层下方
 */
import TheWorld from './TheWorld'

class EntityExtDraw extends egret.Shape {
    init(layer: number) {
        this.zIndex = layer
        TheWorld.addChild(this)
    }

    preUpdate() {
        this.graphics.clear()
    }
}

export default new EntityExtDraw()

import {drawPolygonPoints} from '../utils/display'
import {BaseUnit} from './BaseUnit'


export function drawUnitGraph(this: BaseUnit) {
    const graphics = this.display.graphics
    graphics.clear()
    graphics.beginFill(this.player.color)
    graphics.lineStyle(1, 0x66FF99)
    drawPolygonPoints(graphics, 0, 0, 3, this.radius)
    graphics.endFill()
    this.display.cacheAsBitmap = true
}

export function maskIconDisplay(this: egret.Bitmap, radius: number) {
    this.width = this.height = radius * 2
    this.anchorOffsetX = this.anchorOffsetY = radius
    const mask = new egret.Shape()
    mask.graphics.beginFill(1)
    mask.graphics.drawCircle(0, 0, radius)
    mask.graphics.endFill()
    mask.cacheAsBitmap = true
    this.mask = mask
}
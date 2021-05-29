import {BaseUnit} from './BaseUnit'
import {drawPolygonPoints} from '../utils/display'
import Icons from '../ui/components/Icons'
import Shape = egret.Shape

export class ProductUnit extends BaseUnit {
    readonly type: 'ProductUnit' = 'ProductUnit'

    get baseEnergy(): number {
        return 20
    }

    maxEnergy = 30
    radius = 12
    speed = 200
    iconDisplay = new egret.Bitmap(Icons.warPick)

    radiusChange() {
        const graphics = this.display.graphics
        graphics.clear()
        graphics.beginFill(this.player.color)
        graphics.lineStyle(1, 0x66FF99)
        drawPolygonPoints(graphics, 0, 0, 3, this.radius)
        graphics.endFill()
        this.display.cacheAsBitmap = true
    }

    init() {
        super.init()

        const iconSize = this.radius * 0.5
        this.iconDisplay.width = this.iconDisplay.height = iconSize * 2
        this.iconDisplay.anchorOffsetX = this.iconDisplay.anchorOffsetY = iconSize
        const mask = new Shape()
        mask.graphics.beginFill(1)
        mask.graphics.drawCircle(0, 0, iconSize)
        mask.graphics.endFill()
        mask.cacheAsBitmap = true
        this.iconDisplay.mask = mask

        this.display.addChild(this.iconDisplay)
    }
}
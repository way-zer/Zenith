import {BaseUnit} from '../BaseUnit'
import {clamp} from '../../utils/other'
import {drawProgress} from '../../utils/display'
import GlowFilter = egret.GlowFilter

export class UnitInfo extends egret.Shape {
    constructor(private unit: BaseUnit) {
        super()
    }

    private cacheHealth = -1
    private cacheEnergy = -1

    update(force: boolean = false) {
        const health = clamp(this.unit.health / this.unit.maxHealth, 0, 1)
        const energy = clamp(this.unit.energy / this.unit.maxEnergy, 0, 1)
        if (this.cacheHealth == health && this.cacheEnergy == energy && !force) return
        this.cacheHealth = health
        this.cacheEnergy = energy

        const color = this.unit.player.local ? 0x00ff00 : 0xff0000
        const g = this.graphics
        g.clear()
        drawProgress(g, 0, -20, 64, 12, 2, color, health)
        if (energy != 0)
            drawProgress(g, 0, -12, 64, 6, 1, 0x0000ff, energy)
        this.unit.display.filters = this.selected ? [new GlowFilter()] : []
    }

    private _selected = false
    get selected() {
        return this._selected
    }

    set selected(v) {
        if (v != this.selected) {
            this._selected = v
            this.update(true)
        }
    }
}
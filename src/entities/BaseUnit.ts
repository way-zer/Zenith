import {BaseInfo} from "./comp/BaseInfo";
import {MoveControl} from "./comp/MoveControl";
import DisplayObject = egret.DisplayObject;

export interface BaseUnit extends DisplayObject {
    readonly info: BaseInfo
    readonly move: MoveControl
    readonly body: UnitBody
}

export class UnitBody extends p2.Body {
    static readonly Event_Impact = "impact"

    constructor(public unit: BaseUnit, radius?: number) {
        super({mass: 1});
        if (radius !== undefined)
            this.setRadius(radius)
    }

    setRadius(radius: number): boolean {
        if (this.boundingRadius == radius) return false
        this.shapes = [new p2.Circle({radius: radius})]
        this.updateBoundingRadius()
        return true
    }

    onImpact(other: p2.Body) {
        this.emit({type: UnitBody.Event_Impact, other})
    }
}
import * as Phaser from "phaser";
import {TheWorld} from "./ui/TheWorld";
import DisplayObject = egret.DisplayObject;

const colors = Phaser.Display.Color.HSVColorWheel(1, 1)

export function randomColor() {
    // @ts-ignore
    return colors[Phaser.Math.Between(0, 359)].color
}

export function setRandomPosition(world: TheWorld, obj: DisplayObject) {
    obj.x = Math.random() * world.width
    obj.y = Math.random() * world.height
}

export function clamp(v:number,min:number,max:number):number{
    if(v<min)return min
    if(v>max)return max
    return v
}


type PosInfo = { x: number, y: number, rotation?: number }

export function p2ToDisplay(body: p2.Body, out: PosInfo = {} as any): PosInfo {
    out.x = body.position[0]
    out.y = -body.position[1]
    out.rotation = 360 - body.angle * 180 / Math.PI
    return out
}

export function displayToP2(info: PosInfo, body?: p2.Body): number[] {
    const position = []
    position[0] = info.x
    position[1] = -info.y
    if (body != undefined) {
        body.position = position
        if (info.rotation !== undefined)
            body.angle = (360 - info.rotation) / 180 * Math.PI
    }
    return position
}
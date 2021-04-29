import {randomColor} from "../util";
import {MoveControl} from "./comp/MoveControl";
import {BaseInfo} from "./comp/BaseInfo";
import {BaseUnit, UnitBody} from "./BaseUnit";
import {TheWorld} from "../ui/TheWorld";
import Graphics = egret.Graphics;

function drawPolygonPoints(graphics: Graphics, centerX: number, centerY: number, sides: number, radius: number, startAngle: number = Math.PI / 2) {
    const points = [];
    let angle = startAngle
    for (let i = 0; i < sides; i++) {
        points.push({x: centerX + radius * Math.cos(angle), y: centerY + radius * Math.sin(angle)})
        angle += 2 * Math.PI / sides
    }
    graphics.moveTo(points[0].x, points[0].y)
    for (let i = sides - 1; i >= 0; i--) {
        graphics.lineTo(points[i].x, points[i].y)
    }
}

export class Core extends egret.Shape implements BaseUnit {
    body: UnitBody = new UnitBody(this)
    move: MoveControl
    info = new BaseInfo(this, 1000)
    color = randomColor()
    scale: number = 1

    constructor() {
        super();
        this.draw()
        this.move = new MoveControl(this)
        this.addEventListener(egret.Event.ENTER_FRAME, this.update, this)
    }

    private draw() {
        this.graphics.beginFill(0x0099FF)
        this.graphics.lineStyle(1, 0x66FF99)
        drawPolygonPoints(this.graphics, 0, 0, 8, 16 * this.scale)
        this.graphics.endFill()
        this.graphics.beginFill(this.color)
        this.graphics.lineStyle(1, 1, 0x993300)
        this.graphics.drawCircle(0, 0, 8 * this.scale)
    }

    update() {
        const delta = TheWorld.deltaTime
        const newScale = this.info.energy / 1000
        if (this.body.setRadius(15 * newScale)) {
            this.scale = newScale
            this.draw()
        }
        this.move.speed = 5000 / Math.pow(this.info.energy, 0.3)
        this.move.update(delta)
    }

    onDeath() {

    }
}
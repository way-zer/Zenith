import Phaser from 'phaser'
import {config} from '../config'
import Graphics = egret.Graphics

const colors = Phaser.Display.Color.HSVColorWheel(1, 1)

export function randomColor() {
    // @ts-ignore
    return colors[Phaser.Math.Between(0, 29) * 12].color
}

export function randomPosition(): { x: number, y: number } {
    return {
        x: Math.random() * config.world.width,
        y: Math.random() * config.world.height,
    }
}

export function drawPolygonPoints(graphics: Graphics, centerX: number, centerY: number, sides: number, radius: number, startAngle: number = Math.PI / 2) {
    const points = []
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
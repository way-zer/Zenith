// @ts-ignore
import HSVColorWheel from 'phaser/src/display/color/HSVColorWheel'
import {config} from '../config'
import Graphics = egret.Graphics

const colors = HSVColorWheel(1, 1)

export function randomColor() {
    // @ts-ignore
    return colors[Math.floor(Math.random() * 30) * 12].color
}

type Pos = { x: number, y: number }

export function randomPosition(): Pos {
    return {
        x: Math.random() * config.world.width,
        y: Math.random() * config.world.height,
    }
}

export function randomPositionAround(c: Pos, radius: number): Pos {
    return {
        x: c.x + (Math.random() * 2 - 1) * radius,
        y: c.y + (Math.random() * 2 - 1) * radius,
    }
}

/**绘制正多边形*/
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

/**
 * 绘制进度条
 * @param g 图形
 * @param centerX 中心x
 * @param centerY 中心y
 * @param width 进度条宽度
 * @param height 进度条高度
 * @param thickness 边框宽度
 * @param color 填充色
 * @param progress 进度 0-1
 */
export function drawProgress(g: Graphics, centerX: number, centerY: number, width: number, height: number, thickness: number, color: number, progress: number) {
    g.lineStyle(thickness, 0)
    g.drawRect(centerX - width / 2, centerY - height / 2, width, height)
    g.beginFill(color)
    g.drawRect(
        centerX - width / 2 + thickness,
        centerY - height / 2 + thickness,
        (width - 2 * thickness) * progress,
        height - 2 * thickness)
    g.endFill()
}
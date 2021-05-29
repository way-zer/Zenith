export function clamp(v: number, min: number, max: number): number {
    if (v < min) return min
    if (v > max) return max
    return v
}

export function fixRect(box: egret.Rectangle) {
    const {width, height} = box
    if (width < 0)
        [box.x, box.width] = [box.right, -width]
    if (height < 0)
        [box.y, box.height] = [box.bottom, -height]
}
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
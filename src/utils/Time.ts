export class Time {
    static deltaTime = 1

    static get now() {
        return egret.getTimer()
    }

    private static lastTime = Time.now

    static updateDelta() {
        const now = this.now
        this.deltaTime = now - this.lastTime
        this.lastTime = now
    }
}

export class Interval {
    private lastTime = 0

    check(interval: number): boolean {
        return Time.now - this.lastTime > interval
    }

    reset() {
        this.lastTime = Time.now
    }
}
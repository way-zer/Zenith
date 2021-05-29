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
    private time = 0

    check(interval: number, reset: boolean = false): boolean {
        this.time += Time.deltaTime
        if (this.time > Time.deltaTime) {
            if (reset) this.time = 0
            return true
        }
        return false
    }

    reset() {
        this.time = 0
    }
}
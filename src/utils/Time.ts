export const Time = {
    deltaTime: 1,
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
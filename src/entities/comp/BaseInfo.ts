export class BaseInfo {
    constructor(
        private readonly parent: { onDeath(): void },
        private readonly baseEnergy: number,
    ) {
    }

    extEnergy = 0
    healthLoss = 0

    get energy() {
        return this.baseEnergy + this.extEnergy
    }

    get maxHealth() {
        return this.energy / 10;
    }

    pickEnergy(amount: number) {
        this.extEnergy += amount
    }

    damage(value: number) {
        this.healthLoss += value
        if (this.healthLoss >= this.maxHealth)
            this.parent.onDeath()
    }

    reset() {
        this.extEnergy = 0
        this.healthLoss = 0
    }
}
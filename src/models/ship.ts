export class Ship {
    position: {
        x: number
        y: number
    } // start position for the ship
    direction: boolean // true - vertical, false - horizontal
    length: number
    type: 'small' | 'medium' | 'large' | 'huge'
    hitCells: number

    constructor({
        position,
        direction,
        length,
        type,
    }: {
        position: { x: number; y: number }
        direction: boolean
        length: number
        type: 'small' | 'medium' | 'large' | 'huge'
    }) {
        this.position = position
        this.direction = direction
        this.length = length
        this.type = type
        this.hitCells = 0
    }

    isHit(x: number, y: number) {
        if (this.direction) {
            return (
                this.position.x === x &&
                y >= this.position.y &&
                y < this.position.y + this.length
            )
        }
        return (
            x >= this.position.x &&
            x < this.position.x + this.length &&
            this.position.y === y
        )
    }

    isKilled() {
        return this.hitCells === this.length
    }

    addHit() {
        this.hitCells++
    }

    getNearbyCells() {
        const result = []
        if (!this.direction) {
            for (
                let i = this.position.x - 1;
                i <= this.position.x + this.length;
                i++
            ) {
                result.push({ x: i, y: this.position.y - 1 })
                result.push({ x: i, y: this.position.y + 1 })
            }
            result.push({
                x: this.position.x + this.length,
                y: this.position.y,
            })
            result.push({ x: this.position.x - 1, y: this.position.y })
        } else {
            for (
                let i = this.position.y - 1;
                i <= this.position.y + this.length;
                i++
            ) {
                result.push({ x: this.position.x - 1, y: i })
                result.push({ x: this.position.x + 1, y: i })
            }
            result.push({
                x: this.position.x,
                y: this.position.y + this.length,
            })
            result.push({ x: this.position.x, y: this.position.y - 1 })
        }

        return result.filter(({ x, y }) => x >= 0 && x < 10 && y >= 0 && y < 10)
    }
}

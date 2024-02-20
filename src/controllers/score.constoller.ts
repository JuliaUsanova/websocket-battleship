const _score = new Map<string, number>()

export class ScoreController {
    static get total() {
        return Array.from(_score.entries()).map(([name, wins]) => {
            return { name, wins }
        })
    }

    static addWin(name: string) {
        if (_score.has(name)) {
            _score.set(name, (_score.get(name) || 0) + 1)
        } else {
            _score.set(name, 1)
        }
    }

    static reset() {
        _score.clear()
    }
}

import { Database } from '../validators'


const _score = new Map<number, number>()

export class Score {
    static get total() {
        const result = []

        for (const [userId, numberOfWins] of _score.entries()) {
            const name = Database.getUser(userId)?.name;

            // TODO: HANDLE ERROR
            if (!name) {
                throw new Error('User not found')
            }

            result.push({
                name,
                wins: numberOfWins,
            })
        }

        return result
    }

    static addWin(userId: number) {
        if (_score.has(userId)) {
            _score.set(userId, (_score.get(userId) || 0) + 1)
        } else {
            _score.set(userId, 1)
        }
    }

    static reset() {
        _score.clear()
    }
}

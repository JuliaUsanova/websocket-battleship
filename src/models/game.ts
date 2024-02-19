import { Ship } from './'

let id = 0
export class Game {
    id: number
    status: 'waiting' | 'ready' | 'started' | 'finished' = 'waiting'
    players = new Map<number, Ship[]>()
    roomId: number

    constructor(roomId: number, playersIds: number[]) {
        this.roomId = roomId
        this.id = id++
        this.setup(playersIds)
    }

    hasPlayer(playerIndex: number) {
        return this.players.get(playerIndex)
    }

    getShips(playerIndex: number) {
        if (!this.hasPlayer(playerIndex)) {
            throw new Error('Player not found')
        }
        return this.players.get(playerIndex) || ([] as Ship[])
    }

    addShips(playerIndex: number, ships: Ship[]) {
        if (!this.hasPlayer(playerIndex)) {
            throw new Error('Player not found')
        }
        this.players.set(playerIndex, ships)

        this.updateStatus()
    }

    private setup(playersIds: number[]) {
        playersIds.forEach((id) => {
            this.players.set(id, [])
        })
    }

    private updateStatus() {
        const [player1Ships, player2Ships] = Array.from(this.players.values())
        const isReady = player1Ships && player1Ships.length > 0 && player2Ships && player2Ships.length > 0

        if (isReady) {
            this.status = 'ready'
        }
    }
}

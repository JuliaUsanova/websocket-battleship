import { AttackStatus } from '../constants/constants'
import { Ship } from './'

let id = 0
export class Game {
    id: number
    status: 'waiting' | 'started' | 'finished' = 'waiting'
    players = new Map<number, Ship[]>()
    roomId: number
    lastAttackStatus: AttackStatus
    lastAffectedCells: { x: number; y: number }[] = []

    constructor(roomId: number, playersIds: number[]) {
        this.roomId = roomId
        this.id = id++
        this.setup(playersIds)
        this.updateStatus()
    }

    attack(playerIndex: number, { x, y }: { x: number; y: number }) {
        if (!this.hasPlayer(playerIndex)) {
            throw new Error('Player not found')
        }

        const enemyIndex = Array.from(this.players.keys()).find(
            (index) => index !== playerIndex
        )

        if (!enemyIndex || !this.hasPlayer(enemyIndex)) {
            throw new Error('Enemy not found')
        }

        const playerShips = this.getShips(enemyIndex)
        const attackedShip = playerShips.find((ship) => ship.isHit(x, y))
        this.lastAttackStatus = AttackStatus.MISS

        if (attackedShip) {
            attackedShip.addHit()

            this.lastAttackStatus = attackedShip.isKilled()
                ? AttackStatus.KILLED
                : AttackStatus.SHOT
            this.lastAffectedCells =
                this.lastAttackStatus === AttackStatus.KILLED
                    ? attackedShip?.getNearbyCells()
                    : [{ x, y }]
        }

        this.lastAffectedCells = [{ x, y }]
        this.updateStatus()
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
        this.players.set(
            playerIndex,
            ships.map((ship) => new Ship({ ...ship }))
        )
        this.updateStatus()
    }

    getNextPlayerTurn(playerIndex: number) {
        const nextPlayerTurn = Array.from(this.players.keys()).find(
            (playerId) => playerId !== playerIndex
        )

        if (!nextPlayerTurn) {
            throw new Error('Player not found')
        }
        return nextPlayerTurn
    }

    private updateStatus() {
        const [player1Ships, player2Ships] = Array.from(this.players.values())
        const isReady =
            player1Ships &&
            player1Ships.length > 0 &&
            player2Ships &&
            player2Ships.length > 0

        if (isReady) {
            this.status = 'started'
        }

        if (
            (player1Ships?.length &&
                player1Ships?.every((ship) => ship.isKilled())) ||
            (player2Ships?.length &&
                player2Ships?.every((ship) => ship.isKilled()))
        ) {
            this.status = 'finished'
        }
    }

    private setup(playersIds: number[]) {
        playersIds.forEach((id) => {
            this.players.set(id, [])
        })
    }
}

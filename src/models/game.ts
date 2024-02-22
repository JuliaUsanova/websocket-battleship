import { AttackStatus } from '../constants/constants'
import { Ship } from './'

let id = 0
export class Game {
    private players = new Map<number, Ship[]>()
    id: number
    status: 'waiting' | 'started' | 'finished' = 'waiting'
    roomId: number
    lastAttackStatus: AttackStatus
    lastAffectedCells: { x: number; y: number }[] = []
    hitCells: Record<number, { x: number; y: number }[]> = {}
    killedShip: Ship | null = null

    constructor(roomId: number) {
        this.roomId = roomId
        this.id = id++
        this.updateStatus()
    }

    get playersIds() {
        return Array.from(this.players.keys())
    }

    attack(playerIndex: number, { x, y }: { x: number; y: number }) {
        if (
            this.hitCells[playerIndex]?.find(
                (cell) => cell.x === x && cell.y === y
            )
        ) {
            return
        }

        if (!this.hasPlayer(playerIndex)) {
            throw new Error('Player not found')
        }

        const enemyIndex = Array.from(this.players.keys()).find(
            (index) => index !== playerIndex
        )

        if (!enemyIndex || !this.hasPlayer(enemyIndex)) {
            throw new Error('Enemy not found')
        }

        this.lastAttackStatus = AttackStatus.MISS
        this.lastAffectedCells = [{ x, y }]
        this.killedShip = null

        const playerShips = this.getShips(enemyIndex)
        const attackedShip = playerShips.find((ship) => ship.isHit(x, y))

        if (attackedShip) {
            attackedShip.addHit()

            this.lastAttackStatus = attackedShip.isKilled
                ? AttackStatus.KILLED
                : AttackStatus.SHOT

            if (this.lastAttackStatus === AttackStatus.KILLED) {
                this.lastAffectedCells = attackedShip?.getNearbyCells()
                this.killedShip = attackedShip
            }
        }

        this.hitCells[playerIndex]?.push({ x, y })
        this.updateStatus()
    }

    addPlayer(userId: number) {
        if (this.players.has(userId)) {
            throw new Error('Player already exists')
        }
        if (this.players.size >= 2) {
            throw new Error('Game is full')
        }
        this.players.set(userId, [])
        this.hitCells[userId] = []
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

    getNextPlayerIndex(playerIndex: number) {
        const nextPlayerTurn = Array.from(this.players.keys()).find(
            (playerId) => playerId !== playerIndex
        )

        if (!nextPlayerTurn) {
            throw new Error('Player not found')
        }
        return nextPlayerTurn
    }

    getWinnerId() {
        if (this.status !== 'finished') {
            throw new Error('Game is not finished')
        }
        for (const [id, ships] of this.players.entries()) {
            if (ships.some((ship) => !ship.isKilled)) {
                return id
            }
        }
        throw new Error('Winner not found')
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

        for (const [, ships] of this.players.entries()) {
            if (ships.every((ship) => ship.isKilled)) {
                this.status = 'finished'
            }
        }
    }
}

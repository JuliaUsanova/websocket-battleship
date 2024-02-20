import { AttackStatus } from '../constants/constants'
import { Game, Room, User } from '../models'
import { GameController } from './game.controller'
import { RoomController } from './room.controller'
import { ScoreController } from './score.constoller'
import { UserController } from './user.controller'

export class Handler {
    static createUser(id: number, data: UserRequestData): UserResponseData {
        return UserController.addUser(new User({ ...data, id }))
    }

    static createRoom(): Room {
        const room = new Room()

        RoomController.addRoom(room)

        return room
    }

    static addUserToRoom(userId: number, roomId: number): RoomResponseData[] {
        const user = UserController.getUser(userId)
        const room = RoomController.getRoom(roomId)

        if (!user) {
            throw new Error('User not found')
        }

        if (!room) {
            throw new Error('Room not found')
        }

        if (room.hasUser(userId)) {
            throw new Error('User already in the room')
        }

        room.addUser(userId)
        RoomController.saveRoom(room)

        const roomUsers = UserController.getUsersByIds(room.users).map((u) => ({
            index: u.index,
            name: u.name,
        }))

        return [
            {
                roomId: room.roomId,
                roomUsers: roomUsers,
            },
        ]
    }

    static createGame(userId: number): CreateGameResponseData {
        const room = RoomController.getActiveRoomByUserId(userId)

        if (!room) {
            throw new Error('Room not found')
        }

        const game = new Game(room.roomId)
        GameController.addGame(game)
        room.addGameId(game.id)
        RoomController.saveRoom(room)

        return this.addUserToGame(userId, game.id)
    }

    static addUserToGame(userId: number, gameId: number) {
        const game = GameController.getGame(gameId)

        if (!game) {
            throw new Error('Game not found')
        }

        game.addPlayer(userId)
        GameController.saveGame(game)

        return {
            idGame: game.id,
            idPlayer: userId,
        }
    }

    static addShips(userId: number, data: AddShipsRequestData): void {
        const game = GameController.getGame(data.gameId)

        if (!game) {
            throw new Error('Game not found')
        }

        game.addShips(userId, data.ships)
    }

    static startGame(userId: number): StartGameResponseData {
        const game = GameController.getActiveGameByUserId(userId)

        if (!game) {
            throw new Error('Game not found')
        }

        return {
            ships: game.getShips(userId),
            currentPlayerIndex: userId,
        }
    }

    static attack(userId: number, data: AttackRequestData): AttackResponse {
        const game = GameController.getGame(data.gameId)

        if (!game) {
            throw new Error('Game not found')
        }

        const { x, y } = data
        game.attack(userId, { x, y })

        return {
            status: game.lastAttackStatus,
            position: { x, y },
            currentPlayer: userId,
        }
    }

    static randomAttack(
        userId: number,
        data: RandomAttackRequestData
    ): AttackResponse {
        const x = Math.floor(Math.random() * 10)
        const y = Math.floor(Math.random() * 10)

        return this.attack(userId, { ...data, x, y })
    }

    static buildTurnResponse(
        game: Game,
        currentPlayerId: number
    ): PlayerTurnResponse {
        const secondPlayerId = game.getNextPlayerIndex(currentPlayerId)
        const nextTurnId =
            game.lastAttackStatus === AttackStatus.KILLED ||
            game.lastAttackStatus === AttackStatus.SHOT
                ? currentPlayerId
                : secondPlayerId
        return { currentPlayer: nextTurnId }
    }

    static finishGame(gameId: number): void {
        const game = GameController.getGame(gameId)

        if (!game) {
            throw new Error('Game not found')
        }

        const winnerId = game.getWinnerId()
        const user = UserController.getUser(winnerId)
        const room = RoomController.getRoomByGameId(gameId)

        if (!user) {
            throw new Error('User not found')
        }

        if (!room) {
            throw new Error('Room not found')
        }

        ScoreController.addWin(user.name)
        room.clear()
    }

    static updateScore(): ScoreResponseData[] {
        return ScoreController.total
    }
}

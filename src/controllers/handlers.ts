import { AttackStatus } from '../constants/constants'
import { DuplicatedUserInTheRoomError, NotFoundError } from '../custom-errors'
import { Game, Room, User } from '../models'
import { GameController } from './game.controller'
import { RoomController } from './room.controller'
import { ScoreController } from './score.constoller'
import { UserController } from './user.controller'

export const createUser = (
    id: number,
    data: UserRequestData
): UserResponseData => {
    const users = UserController.getAllUsers()
    const duplicatedUser = users.find((u) => u.name === data.name)
    if (duplicatedUser) {
        return {
            name: data.name,
            index: duplicatedUser.index,
            error: 1,
            errorText: 'User already exists',
        }
    }
    const user = UserController.addUser(new User({ ...data, id }))
    return {
        name: user.name,
        index: user.index,
        error: 0,
        errorText: null,
    }
}

export const createRoom = (userId: number): RoomResponseData[] => {
    const user = UserController.getUser(userId)

    if (!user) {
        throw new NotFoundError('user', userId)
    }

    const userRooms = user.rooms

    if (userRooms.length > 0) {
        userRooms.forEach((roomId) => {
            const activeRoom = RoomController.getRoom(roomId)
            if (activeRoom && activeRoom.users.length === 1) {
                throw new DuplicatedUserInTheRoomError(user.name)
            }
        })
    }

    const room = RoomController.addRoom(new Room())
    user.addRoom(room.roomId)

    addUserToRoom(userId, room.roomId)

    return getActiveRooms()
}

export const getUpdateRoomRecepients = (): number[] => {
    return UserController.getAllUsers().map((u) => u.index)
}

export const addUserToRoom = (userId: number, roomId: number) => {
    const user = UserController.getUser(userId)
    const room = RoomController.getRoom(roomId)

    if (!user) {
        throw new NotFoundError('user', userId)
    }

    if (!room) {
        throw new NotFoundError('room', roomId)
    }

    if (room.hasUser(userId)) {
        throw new DuplicatedUserInTheRoomError(user.name)
    }

    room.addUser(userId)

    return room
}

export const getActiveRooms = (): RoomResponseData[] => {
    const rooms = RoomController.getActiveRooms().map((r) => ({
        roomId: r.roomId,
        roomUsers: UserController.getUsersByIds(r.users).map((u) => ({
            index: u.index,
            name: u.name,
        })),
    }))

    return rooms
}

export const createGame = (
    player1?: number,
    player2?: number
): CreateGameResponseData[] => {
    if (!player1 || !player2) {
        throw new NotFoundError('user')
    }

    const room = RoomController.getActiveRoomByUserId(player1)

    if (!room) {
        throw new NotFoundError('room')
    }

    const game = GameController.addGame(new Game(room.roomId))
    room.addGameId(game.id)

    return [addUserToGame(player1, game.id), addUserToGame(player2, game.id)]
}

export const addUserToGame = (userId: number, gameId: number) => {
    const game = GameController.getGame(gameId)

    if (!game) {
        throw new NotFoundError('game', gameId)
    }

    game.addPlayer(userId)

    return {
        idGame: game.id,
        idPlayer: userId,
    }
}

export const addShips = (userId: number, data: AddShipsRequestData) => {
    const game = GameController.getGame(data.gameId)

    if (!game) {
        throw new NotFoundError('game', data.gameId)
    }

    game.addShips(userId, data.ships)

    return game
}

export const startGame = (userId: number): StartGameResponseData => {
    const game = GameController.getActiveGameByUserId(userId)

    if (!game) {
        throw new NotFoundError('game')
    }

    return {
        ships: game.getShips(userId),
        currentPlayerIndex: userId,
    }
}

export const buildAttackResponse = (
    userId: number,
    data: AttackRequestData
): AttackResponse[] => {
    const attackResults = []
    const game = GameController.getGame(data.gameId)

    if (!game) {
        throw new NotFoundError('game', data.gameId)
    }

    const { x, y } = data
    game.attack(userId, { x, y })

    if (game.killedShip) {
        game.killedShip.shipCells.forEach((cell) => {
            const attack = {
                status: AttackStatus.KILLED,
                position: cell,
                currentPlayer: userId,
            }
            attackResults.push(attack)
        })

        game.lastAffectedCells.forEach((cell) => {
            const attack = {
                status: AttackStatus.MISS,
                position: cell,
                currentPlayer: userId,
            }
            attackResults.push(attack)
        })
    } else {
        const attack = {
            status: game.lastAttackStatus,
            position: { x, y },
            currentPlayer: userId,
        }

        attackResults.push(attack)
    }

    return attackResults
}

export const buildTurnResponse = (
    gameId: number,
    currentPlayerId: number
): PlayerTurnResponse => {
    const game = GameController.getGame(gameId)

    if (!game) {
        throw new NotFoundError('game', gameId)
    }

    const secondPlayerId = game.getNextPlayerIndex(currentPlayerId)
    const nextTurnId =
        game.lastAttackStatus === AttackStatus.KILLED ||
        game.lastAttackStatus === AttackStatus.SHOT
            ? currentPlayerId
            : secondPlayerId
    return { currentPlayer: nextTurnId }
}

export const finishGame = (gameId: number): FinishGameResponseData => {
    const game = GameController.getGame(gameId)

    if (!game) {
        throw new NotFoundError('game', gameId)
    }

    const winnerId = game.getWinnerId()
    const user = UserController.getUser(winnerId)
    const room = RoomController.getRoomByGameId(gameId)

    if (!user) {
        throw new NotFoundError('user', winnerId)
    }

    if (!room) {
        throw new NotFoundError('room')
    }

    ScoreController.addWin(user.name)
    RoomController.removeRoom(room.roomId)

    return { winPlayer: winnerId }
}

export const updateScore = (): ScoreResponseData[] => {
    return ScoreController.total
}

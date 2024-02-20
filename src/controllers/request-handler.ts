import { ResponseType } from '../constants'
import { RequestType } from '../constants/constants'
import { Database } from '../db'
import { Game, Room, Score, User } from '../models'
import { isUser } from '../type-guards'

export class Handlers {
    static createUser(
        id: number,
        data: RequestData
    ): ResponseMessage<ResponseData> {
        // TODO: MOVE TO VALIDATION
        if (!isUser(data)) {
            throw new Error(
                'Invalid request data, name and password are required'
            )
        }

        const user = Database.addUser(new User({ ...data, id }))

        return {
            data: {
                index: user.index,
                name: user.name,
                error: user.error,
                errorText: user.errorText,
            },
            type: ResponseType.REGISTER,
        }
    }

    static createRoom(userId: number): ResponseMessage<ResponseData> {
        const user = Database.getUser(userId)

        if (!user) {
            throw new Error('Create user before creating a game room')
        }

        if (Database.getRoomByUserId(userId)) {
            throw new Error('User already in a room')
        }

        const room = new Room()
        room.addUser(user)
        Database.addRoom(room)

        return {
            data: [
                {
                    roomId: room.roomId,
                    roomUsers: room.users,
                },
            ],
            type: ResponseType.UPDATE_ROOMS,
        }
    }

    static addUserToRoom(
        userId: number,
        data: RequestData
    ): ResponseMessage<ResponseData> {
        const user = Database.getUser(userId)

        if (!user) {
            throw new Error('User not found')
        }

        if (!('indexRoom' in data)) {
            throw new Error('Provide index for room')
        }

        const room = Database.getRoom(data.indexRoom)

        if (!room) {
            throw new Error('Room not found')
        }

        if (!room.hasUser(userId)) {
            room.addUser(user)
            Database.saveRoom(room)
        }

        return {
            data: [
                {
                    roomId: room.roomId,
                    roomUsers: room.users,
                },
            ],
            type: ResponseType.UPDATE_ROOMS,
        }
    }

    static createGame(userId: number): ResponseMessage<ResponseData> {
        const room = Database.getRoomByUserId(userId)

        if (!room) {
            throw new Error('Room not found')
        }

        const roomUsersIds = room.users.map((u) => u.index)
        const game = new Game(room.roomId, roomUsersIds)
        Database.saveGame(game)

        return {
            data: {
                idGame: game.id,
                idPlayer: userId,
            },
            type: ResponseType.CREATE_GAME,
        }
    }

    static addShips(id: number, data: RequestData): void {
        if (
            !('gameId' in data) ||
            !('ships' in data) ||
            !('indexPlayer' in data)
        ) {
            throw new Error(
                'Please provide required fields: gameId, ships and indexPlayer'
            )
        }

        const game = Database.getActiveGameByUserId(id)

        if (!game) {
            throw new Error('Game not found')
        }

        game.addShips(id, data.ships)

        // return {
        //     data: {
        //         ships: game.getShips(id),
        //         currentPlayerIndex: id,
        //     },
        //     type: ResponseType.START_GAME,
        // }
    }

    static startGame(userId: number): ResponseMessage<ResponseData> {
        const game = Database.getActiveGameByUserId(userId)

        if (!game) {
            throw new Error('Game not found')
        }

        return {
            data: {
                ships: game.getShips(userId),
                currentPlayerIndex: userId,
            },
            type: ResponseType.START_GAME,
        }
    }

    static attack(
        userId: number,
        data: RequestData
    ): ResponseMessage<ResponseData> {
        if (!('gameId' in data) || !('x' in data) || !('y' in data)) {
            throw new Error('Please provide required fields: gameId, x and y')
        }

        const game = Database.getActiveGameByUserId(userId)

        if (!game) {
            throw new Error('Game not found')
        }

        const { x, y } = data
        game.attack(userId, { x, y })

        return Handlers.buildAttackResponse(userId, { x, y }, game)
    }

    static buildAttackResponse(
        userId: number,
        { x, y }: { x: number; y: number },
        game?: Game
    ): ResponseMessage<ResponseData> {
        if (!game) {
            throw new Error('Game not found')
        }

        return {
            data: {
                status: game.lastAttackStatus,
                position: { x, y },
                currentPlayer: userId,
            },
            type: ResponseType.ATTACK,
        }
    }

    // static randomAttack(): ResponseMessage<ResponseData> {}

    static buildTurnResponse(userId: number): ResponseMessage<ResponseData> {
        const game = Database.getActiveGameByUserId(userId)

        if (!game) {
            throw new Error('Game not found')
        }

        // const turn = game?.getNextPlayerTurn(userId)
        return {
            type: ResponseType.PLAYER_TURN,
            data: { currentPlayer: userId },
            // data: { currentPlayer: turn },
        }
    }

    static updateScore(): ResponseMessage<ResponseData> {
        return {
            type: ResponseType.UPDATE_SCORE,
            data: Score.total,
        }
    }
}

const getRequestHandler = (type: RequestTypeValue) => {
    switch (type) {
        case RequestType.REGISTER:
            return Handlers.createUser
        case RequestType.CREATE_ROOM:
            return Handlers.createRoom
        case RequestType.ADD_USER_TO_ROOM:
            return Handlers.addUserToRoom
        case RequestType.ADD_SHIPS:
            return Handlers.addShips
        case RequestType.ATTACK:
            return Handlers.attack
        // case RequestType.RANDOM_ATTACK:
        //     return Handlers.finishGame
        default:
            throw new Error('Invalid request type')
    }
}

export const handleRequestByType = (
    type: RequestTypeValue,
    data: RequestData,
    id: number
): ResponseMessage<ResponseData> | void => {
    const handler = getRequestHandler(type)
    const response = handler(id, data)

    return response
}

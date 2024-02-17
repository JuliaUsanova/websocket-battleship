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
        const room = new Room()
        const user = Database.getUser(userId)

        if (!user) {
            throw new Error('Create user before creating a game room')
        }

        room.addUser(user)
        Database.addRoom(room)

        return {
            data: [
                {
                    roomId: room.roomId,
                    roomUsers: room.roomUsers.map((user) => ({
                        index: user.index,
                        name: user.name,
                    })),
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

        room.addUser(user)

        if (room.roomUsers.length === 2) {
            room.roomUsers.forEach((u) => {
                const game = new Game(room.roomId, u.index)
                u.addGame(game.id)
                room.addGameId(game.id)
                Database.saveRoom(room)
                Database.saveGame(game)
                Database.saveUser(u)
            })

            const userGame = Database.getGameByUserId(user.index)!

            return {
                data: {
                    gameId: userGame.id,
                    playerId: user.index,
                },
                type: ResponseType.CREATE_GAME,
            }
        } else {
            Database.saveRoom(room)

            return {
                data: [
                    {
                        roomId: room.roomId,
                        roomUsers: room.roomUsers.map((user) => ({
                            index: user.index,
                            name: user.name,
                        })),
                    },
                ],
                type: ResponseType.UPDATE_ROOMS,
            }
        }
    }

    static addShips(
        id: number,
        data: RequestData
    ): ResponseMessage<ResponseData> {
        if (
            !('gameId' in data) ||
            !('ships' in data) ||
            !('indexPlayer' in data)
        ) {
            throw new Error(
                'Please provide required fields: gameId, ships and indexPlayer'
            )
        }

        const game = Database.getGameByUserId(id)

        if (!game) {
            throw new Error('Game not found')
        }

        console.log('>>>>>>> INDEX PLAYER FROM UI <<<<<<<<< ', data.indexPlayer)
        game.addShips(data.ships)

        return {
            data: {
                ships: game.ships,
                currentPlayerIndex: game.playerIndex,
            },
            type: ResponseType.START_GAME,
        }
    }

    // static attack(): ResponseMessage<ResponseData> { }

    // static randomAttack(): ResponseMessage<ResponseData> {}

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
        // case RequestType.ATTACK:
        //     return Handlers.attack
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
): ResponseMessage<ResponseData> => {
    const handler = getRequestHandler(type)
    return handler(id, data)
}

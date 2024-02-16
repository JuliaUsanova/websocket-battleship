import { ResponseType, ResponseTypeValues } from '../constants'
import { User, WsResponseMessage } from '../models'
import { isUser } from '../type-guards'

// TODO: MOVE TO DB
const users = []
const winners = []
const rooms = []

class Handlers {
    static createUser(data: Record<string, string>): WsResponseMessage {
        if (!isUser(data)) {
            throw new Error('Invalid request data')
        }
        const user = new User(data)
        users.push(user)

        return new WsResponseMessage({
            type: ResponseType.REGISTER,
            data: {
                id: user.id,
                name: user.name,
            },
        })
    }

    static createGame(): WsResponseMessage {
        return new WsResponseMessage({
            type: ResponseType.CREATE_GAME,
            data: {},
        })
    }

    static startGame(): WsResponseMessage {
        return new WsResponseMessage({
            type: ResponseType.START_GAME,
            data: {},
        })
    }

    static playerTurn(): WsResponseMessage {
        return new WsResponseMessage({
            type: ResponseType.PLAYER_TURN,
            data: {},
        })
    }

    static attack(): WsResponseMessage {
        return new WsResponseMessage({
            type: ResponseType.ATTACK,
            data: {},
        })
    }

    static finishGame(): WsResponseMessage {
        return new WsResponseMessage({
            type: ResponseType.FINISH_GAME,
            data: {},
        })
    }

    static updateRooms(): WsResponseMessage {
        return new WsResponseMessage({
            type: ResponseType.UPDATE_ROOMS,
            data: {},
        })
    }

    static updateScore(): WsResponseMessage {
        return new WsResponseMessage({
            type: ResponseType.UPDATE_SCORE,
            data: {},
        })
    }
}

export const getRequestHandler = (
    type: (typeof ResponseTypeValues)[number]
) => {
    switch (type) {
        case ResponseType.REGISTER:
            return Handlers.createUser
        case ResponseType.CREATE_GAME:
            return Handlers.createGame
        case ResponseType.START_GAME:
            return Handlers.startGame
        case ResponseType.PLAYER_TURN:
            return Handlers.playerTurn
        case ResponseType.ATTACK:
            return Handlers.attack
        case ResponseType.FINISH_GAME:
            return Handlers.finishGame
        case ResponseType.UPDATE_ROOMS:
            return Handlers.updateRooms
        case ResponseType.UPDATE_SCORE:
            return Handlers.updateScore
        default:
            throw new Error('Invalid request type')
    }
}

export const handleRequest = (
    type: (typeof ResponseTypeValues)[number],
    data: Record<string, string>
) => {
    const handler = getRequestHandler(type)
    return handler(data)
}

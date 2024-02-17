import { ResponseType, ResponseTypeValues } from '../constants'
import { Database } from '../db'
import { WsResponseMessage } from '../models'
import { isUser } from '../type-guards'

class Handlers {
    static createUser(data: RequestData): WsResponseMessage {
        // TODO: MOVE TO VALIDATION
        if (!isUser(data)) {
            throw new Error('Invalid request data, name and password are required')
        }
        
        const user = Database.addUser(data)

        return new WsResponseMessage({
            type: ResponseType.REGISTER,
            data: {
                index: user.index,
                name: user.name,
                error: user.error,
                errorText: user.errorText,
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
    data: RequestData
) => {
    const handler = getRequestHandler(type)
    return handler(data)
}

import { ResponseType } from '../constants'
import { RequestType } from '../constants/constants'
import { Database } from '../db'
import { Room, Score, User } from '../models'
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

    // static addUserToGame(): ResponseMessage<ResponseData> {}

    // static addShips(): ResponseMessage<ResponseData> {}

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
        // case RequestType.ADD_USER_TO_GAME:
        //     return Handlers.startGame
        // case RequestType.ADD_SHIPS:
        //     return Handlers.playerTurn
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

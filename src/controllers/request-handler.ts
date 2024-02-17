import { ResponseType } from '../constants'
import { RequestType } from '../constants/constants';
import { Database } from '../db'
import { Room, User } from '../models'
import { isUser } from '../type-guards'

class Handlers {
    static createUser(
        data: RequestData,
        id: number
    ): { messageData: ResponseData; messageType: ResponseTypeValue } {
        // TODO: MOVE TO VALIDATION
        if (!isUser(data)) {
            throw new Error(
                'Invalid request data, name and password are required'
            )
        }

        const user = Database.addUser(new User({ ...data, id }))

        const room = new Room()
        room.addUser(user)
        Database.addRoom(room)

        return {
            messageData: {
                index: user.index,
                name: user.name,
                error: user.error,
                errorText: user.errorText,
            },
            messageType: ResponseType.REGISTER,
        }
    }

    static createRoom(
        _data: RequestData,
        userId: number
    ): { messageData: ResponseData; messageType: ResponseTypeValue } {
        const room = new Room()
        const user = Database.getUser(userId)

        if (!user) {
            throw new Error('Create user before creating a game room')
        }

        room.addUser(user)
        Database.addRoom(room)

        return {
            messageData: [
                {
                    roomId: room.roomId,
                    roomUsers: room.roomUsers.map((user) => ({
                        index: user.index,
                        name: user.name,
                    })),
                },
            ],
            messageType: ResponseType.UPDATE_ROOMS,
        }
    }

    // static startGame(): WsResponseMessage {
    //     return new WsResponseMessage({
    //         type: ResponseType.START_GAME,
    //         data: {},
    //     })
    // }

    // static playerTurn(): WsResponseMessage {
    //     return new WsResponseMessage({
    //         type: ResponseType.PLAYER_TURN,
    //         data: {},
    //     })
    // }

    // static attack(): WsResponseMessage {
    //     return new WsResponseMessage({
    //         type: ResponseType.ATTACK,
    //         data: {},
    //     })
    // }

    // static finishGame(): WsResponseMessage {
    //     return new WsResponseMessage({
    //         type: ResponseType.FINISH_GAME,
    //         data: {},
    //     })
    // }

    // static updateRooms(): WsResponseMessage {
    //     return new WsResponseMessage({
    //         type: ResponseType.UPDATE_ROOMS,
    //         data: Database.getRooms(),
    //     })
    // }

    // static updateScore(): WsResponseMessage {
    //     return new WsResponseMessage({
    //         type: ResponseType.UPDATE_SCORE,
    //         data: {},
    //     })
    // }
}

const getRequestHandler = (type: RequestTypeValue) => {
    switch (type) {
        case RequestType.REGISTER:
            return Handlers.createUser
        case RequestType.CREATE_ROOM:
            return Handlers.createRoom
        // case RequestType.START_GAME:
        //     return Handlers.startGame
        // case RequestType.PLAYER_TURN:
        //     return Handlers.playerTurn
        // case RequestType.ATTACK:
        //     return Handlers.attack
        // case RequestType.FINISH_GAME:
        //     return Handlers.finishGame
        // case RequestType.UPDATE_ROOMS:
        //     return Handlers.updateRooms
        // case RequestType.UPDATE_SCORE:
        //     return Handlers.updateScore
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
    const { messageData, messageType } = handler(data, id)
    return { data: messageData, type: messageType }
}

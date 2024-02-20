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

        // return {
        //     data: [
        //         {
        //             roomId: room.roomId,
        //             roomUsers: room.users,
        //         },
        //     ],
        //     type: ResponseType.UPDATE_ROOMS,
        // }
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

        // return {
        //     data: [
        //         {
        //             roomId: room.roomId,
        //             roomUsers: roomUsers,
        //         },
        //     ],
        //     type: ResponseType.UPDATE_ROOMS,
        // }

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
        const game = GameController.getActiveGameByUserId(userId)

        if (!game) {
            throw new Error('Game not found')
        }

        game.addShips(userId, data.ships)

        // return {
        //     data: {
        //         ships: game.getShips(id),
        //         currentPlayerIndex: id,
        //     },
        //     type: ResponseType.START_GAME,
        // }
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
        // return {
        //     data: {
        //         ships: game.getShips(userId),
        //         currentPlayerIndex: userId,
        //     },
        //     type: ResponseType.START_GAME,
        // }
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

    static buildTurnResponse(userId: number): PlayerTurnResponse {
        // const turn = game?.getNextPlayerIndex(userId)
        return { currentPlayer: userId }
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

        // {
        //     name: string;
        //     wins: number;
        // }[]
    }
}

// const getRequestHandler = (type: RequestTypeValue) => {
//     switch (type) {
//         case RequestType.REGISTER:
//             return Handlers.createUser
//         case RequestType.CREATE_ROOM:
//             return Handlers.createRoom
//         case RequestType.ADD_USER_TO_ROOM:
//             return Handlers.addUserToRoom
//         case RequestType.ADD_SHIPS:
//             return Handlers.addShips
//         case RequestType.ATTACK:
//             return Handlers.attack
//         // case RequestType.RANDOM_ATTACK:
//         //     return Handlers.finishGame
//         default:
//             throw new Error('Invalid request type')
//     }
// }

// export const handleRequestByType = (
//     type: RequestTypeValue,
//     data: RequestData,
//     id: number
// ): ResponseMessage<ResponseData> | void => {
//     const handler = getRequestHandler(type)
//     const response = handler(id, data)

//     return response
// }

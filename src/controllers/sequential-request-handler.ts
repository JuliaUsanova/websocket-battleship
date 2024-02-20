import { GAME_STATUS, RequestType, ResponseType } from '../constants'
import { AttackStatus } from '../constants/constants'
import { WsRequestMessage, WsResponseMessage } from '../models'
import { isUser } from '../type-guards'
import { GameController } from './game.controller'
import { Handler } from './handler'
import { RoomController } from './room.controller'

export class SequentialRequestHandler {
    handleRequestByType(
        request: WsRequestMessage<RequestData>,
        userId: number
    ) {
        const handler = this.getHandlersQueeue(request.type)
        return handler(userId, request.data)
    }

    private getHandlersQueeue: (
        type: RequestTypeValue
    ) => (userId: number, data: RequestData) => ResponseMessagesQueue = (
        type
    ) => {

        switch (type) {
            case RequestType.REGISTER:
                if (RoomController.getActiveRooms().length) {
                    return this.addUserToActiveRoom.bind(this)
                } else {
                    return this.createUserAndRoom.bind(this)
                }
            case RequestType.CREATE_ROOM:
            case RequestType.ADD_USER_TO_ROOM:
                // do nothing
                return () => []
            case RequestType.ADD_SHIPS:
                return this.addShips.bind(this)
            case RequestType.ATTACK:
                return this.attack.bind(this)
            case RequestType.RANDOM_ATTACK:
                return this.randomAttack.bind(this)
            default:
                throw new Error('Invalid request type')
        }
    }

    private buildResponseMessageQueue: () => {
        add: (
            message: ResponseMessage<ResponseData>,
            recepientsIds: number[]
        ) => void
        result: () => ResponseMessagesQueue
    } = () => {
        const messages: ResponseMessagesQueue = []

        return {
            add: (message, recepientsIds) => {
                if (!message) {
                    return
                }
                messages.push({
                    message: new WsResponseMessage(message),
                    recepientsIds,
                })
            },
            result: () => messages,
        }
    }

    private createUserAndRoom(
        userId: number,
        data: RequestData
    ): ResponseMessagesQueue {
        if (!isUser(data)) {
            throw new Error(
                'Invalid request data, name and password are required'
            )
        }

        const user = Handler.createUser(userId, data)
        const room = Handler.createRoom()
        const activeRoom = Handler.addUserToRoom(userId, room.roomId)
        const score = Handler.updateScore()
        const queue = this.buildResponseMessageQueue()
        const roomUsers = room.users

        queue.add({ data: user, type: ResponseType.REGISTER }, [userId])
        queue.add(
            { data: activeRoom, type: ResponseType.UPDATE_ROOMS },
            roomUsers
        )
        queue.add({ data: score, type: ResponseType.UPDATE_SCORE }, roomUsers)

        return queue.result()
    }

    private addUserToActiveRoom(
        userId: number,
        data: RequestData
    ): ResponseMessagesQueue {
        if (!isUser(data)) {
            throw new Error(
                'Invalid request data, name and password are required'
            )
        }
        const user = Handler.createUser(userId, data)
        const rooms = RoomController.getActiveRooms()

        if (!rooms.length) {
            throw new Error('No active rooms')
        }

        const room = rooms[0]!
        const activeRoom = Handler.addUserToRoom(userId, room.roomId)
        const score = Handler.updateScore()
        const queue = this.buildResponseMessageQueue()
        const game = Handler.createGame(userId)
        const secondPlayerId = room.users.find((u) => u !== userId)!
        const addUserToGame = Handler.addUserToGame(secondPlayerId, game.idGame)
        const roomUsers = room.users

        queue.add({ data: user, type: ResponseType.REGISTER }, [userId])
        queue.add(
            { data: activeRoom, type: ResponseType.UPDATE_ROOMS },
            roomUsers
        )
        queue.add({ data: score, type: ResponseType.UPDATE_SCORE }, roomUsers)
        queue.add({ data: game, type: ResponseType.CREATE_GAME }, [userId])
        queue.add({ data: addUserToGame, type: ResponseType.CREATE_GAME }, [
            secondPlayerId,
        ])

        return queue.result()
    }

    private addShips(userId: number, data: RequestData): ResponseMessagesQueue {
        if (
            !('gameId' in data) ||
            !('ships' in data) ||
            !('indexPlayer' in data)
        ) {
            throw new Error(
                'Please provide required fields: gameId, ships and indexPlayer'
            )
        }

        const currentPlayerId = data.indexPlayer

        if (userId !== currentPlayerId) {
            throw new Error('Invalid user')
        }

        Handler.addShips(currentPlayerId, data)
        const game = GameController.getGame(data.gameId)

        if (!game) {
            throw new Error('Game not found')
        }

        const queue = this.buildResponseMessageQueue()

        if (game?.status === GAME_STATUS.STARTED) {
            const secondPlayerId = game.getNextPlayerIndex(currentPlayerId)!
            const gameStarted1 = Handler.startGame(currentPlayerId)
            const gameStarted2 = Handler.startGame(secondPlayerId)
            const turn = Handler.buildTurnResponse(game, currentPlayerId)

            queue.add({ data: gameStarted1, type: ResponseType.START_GAME }, [
                currentPlayerId,
            ])
            queue.add({ data: gameStarted2, type: ResponseType.START_GAME }, [
                secondPlayerId,
            ])
            queue.add({ data: turn, type: ResponseType.PLAYER_TURN }, [
                currentPlayerId,
                secondPlayerId,
            ])
        }

        return queue.result()
    }

    private attack(userId: number, data: RequestData) {
        if (!('gameId' in data) || !('x' in data) || !('y' in data)) {
            throw new Error('Please provide required fields: gameId, x and y')
        }

        const currentPlayerId = data.indexPlayer

        if (userId !== currentPlayerId) {
            throw new Error('Invalid user')
        }

        const queue = this.buildResponseMessageQueue()
        const attackResult = Handler.attack(currentPlayerId, data)
        const game = GameController.getGame(data.gameId)

        if (!game) {
            throw new Error('Game not found')
        }

        const secondPlayerId = game.getNextPlayerIndex(currentPlayerId)
        queue.add({ data: attackResult, type: ResponseType.ATTACK }, [
            currentPlayerId,
            secondPlayerId,
        ])

        if (game.status === GAME_STATUS.FINISHED) {
            const winners = Handler.updateScore()
            Handler.finishGame(game.id)

            queue.add({ data: winners, type: ResponseType.UPDATE_SCORE }, [
                currentPlayerId,
                secondPlayerId,
            ])
        } else {
            const turn = Handler.buildTurnResponse(game, currentPlayerId)
            queue.add({ data: turn, type: ResponseType.PLAYER_TURN }, [
                currentPlayerId,
                secondPlayerId,
            ])
        }

        return queue.result()
    }

    private randomAttack(userId: number, data: RequestData) {
        if (!('gameId' in data) || !('indexPlayer' in data)) {
            throw new Error(
                'Please provide required fields: gameId, indexPlayer'
            )
        }

        const currentPlayerId = data.indexPlayer

        if (userId !== currentPlayerId) {
            throw new Error('Invalid user')
        }

        const queue = this.buildResponseMessageQueue()
        const attackResult = Handler.randomAttack(currentPlayerId, data)
        const game = GameController.getGame(data.gameId)

        if (!game) {
            throw new Error('Game not found')
        }

        const secondPlayerId = game.getNextPlayerIndex(currentPlayerId)
        queue.add({ data: attackResult, type: ResponseType.ATTACK }, [
            currentPlayerId,
            secondPlayerId,
        ])
        if (game.status === GAME_STATUS.FINISHED) {
            const winners = Handler.updateScore()
            Handler.finishGame(game.id)

            queue.add({ data: winners, type: ResponseType.UPDATE_SCORE }, [
                currentPlayerId,
                secondPlayerId,
            ])
        } else {
            const turn = Handler.buildTurnResponse(game, currentPlayerId)
            queue.add({ data: turn, type: ResponseType.PLAYER_TURN }, [
                currentPlayerId,
                secondPlayerId,
            ])
        }

        return queue.result()
    }
}

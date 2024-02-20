import {
    GAME_STATUS,
    RequestType,

    ResponseType,
} from '../constants'
import { WsRequestMessage, WsResponseMessage } from '../models'
import { isUser } from '../type-guards'
import { GameController } from './game.controller'
import { Handler } from './handler'
import { RoomController } from './room.controller'

export class SequentialRequestHandler {
    handleRequestByType(request: WsRequestMessage<RequestData>, userId: number) {
        const handler = this.getHandlersQueeue(request.type)
        return handler(userId, request.data)
    }

    private getHandlersQueeue: (
        type: RequestTypeValue
    ) => (userId: number, data: RequestData) => ResponseMessagesQueue =
        (type) => {
            switch (type) {
                case RequestType.REGISTER:
                    if (RoomController.getActiveRooms().length) {
                        return this.addUserToActiveRoom
                    } else {
                        return this.createUserAndRoom
                    }
                // // if no active room, create room
                // ;['createUser', 'createRoom', 'addUserToRoom', 'updateScore']
                // return [
                //     'register - message for only reqistered client',
                //     'updateRoom',
                //     'updateWinners',
                // ]
                // // if active room, add user to room and create game
                // return [
                //     'register',
                //     'updateRoom',
                //     'updateWinners',
                //     'createGame - message for each client with its own id',
                // ]
                case RequestType.ADD_SHIPS:
                    return this.addShips
                // // if another player doesn't have ships, wait
                // return []
                // // if another player has ships, start game
                // return [
                //     'startGame',
                //     'turn - message for each client with current user id',
                // ]
                case RequestType.ATTACK:
                    return this.attack
                // return [
                //     'attackResponse',
                //     'turn - message for each client with current user id',
                // ]
                // // in case game is finished
                // return [
                //     'finish',
                //     'updateWinners',
                //     'clearRoom - do not send the message',
                // ]
                case RequestType.RANDOM_ATTACK:
                    // return [
                    //     'attackResponse',
                    //     'turn - message for each client with current user id',
                    // ]
                    // // in case game is finished
                    // return [
                    //     'finish',
                    //     'updateWinners',
                    //     'clearRoom - do not send the message',
                    // ]
                    return this.randomAttack
                default:
                    throw new Error('Invalid request type')
            }
        }

    private buildResponseMessageQueue: () => {
        add: (
            message: ResponseMessage<ResponseData>,
            shouldUpdateAllClients: boolean
        ) => void
        result: () => ResponseMessagesQueue
    } = () => {
        const messages: ResponseMessagesQueue = []

        return {
            add: (message, shouldUpdateAllClients) => {
                if (!message) {
                    return
                }
                messages.push({
                    message: new WsResponseMessage(message),
                    shouldUpdateAllClients,
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

        queue.add({ data: user, type: ResponseType.REGISTER }, false)
        queue.add({ data: activeRoom, type: ResponseType.UPDATE_ROOMS }, true)
        queue.add({ data: score, type: ResponseType.UPDATE_SCORE }, true)

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
        const addUserToGame = Handler.addUserToGame(userId, secondPlayerId)

        queue.add({ data: user, type: ResponseType.REGISTER }, false)
        queue.add({ data: activeRoom, type: ResponseType.UPDATE_ROOMS }, true)
        queue.add({ data: score, type: ResponseType.UPDATE_SCORE }, true)
        queue.add({ data: game, type: ResponseType.CREATE_GAME }, false)
        queue.add(
            { data: addUserToGame, type: ResponseType.CREATE_GAME },
            false
        )

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

        // // if another player doesn't have ships, wait
        // return []
        // // if another player has ships, start game
        // return [
        //     'startGame',
        //     'turn - message for each client with current user id',
        // ]
        const currentPlayerId = data.indexPlayer

        if (userId !== currentPlayerId) {
            throw new Error('Invalid user')
        }

        Handler.addShips(currentPlayerId, data)
        const game = GameController.getGame(currentPlayerId)

        if (!game) {
            throw new Error('Game not found')
        }

        const queue = this.buildResponseMessageQueue()

        if (game?.status === GAME_STATUS.STARTED) {
            const secondPlayerId = game.getNextPlayerIndex(
                data.indexPlayer
            )!

            const gameStarted1 = Handler.startGame(data.indexPlayer)
            const gameStarted2 = Handler.startGame(secondPlayerId)
            const turn = Handler.buildTurnResponse(secondPlayerId)

            queue.add(
                { data: gameStarted1, type: ResponseType.START_GAME },
                false
            )
            queue.add(
                { data: gameStarted2, type: ResponseType.START_GAME },
                false
            )
            queue.add({ data: turn, type: ResponseType.PLAYER_TURN }, true)
        }

        return queue.result()
    }

    private attack(userId: number, data: RequestData) {
        // return [
        //     'attackResponse',
        //     'turn - message for each client with current user id',
        // ]
        // // in case game is finished
        // return [
        //     'finish',
        //     'updateWinners',
        //     'clearRoom - do not send the message',
        // ]

        if (!('gameId' in data) || !('x' in data) || !('y' in data)) {
            throw new Error('Please provide required fields: gameId, x and y')
        }

        const currentPlayerId = data.indexPlayer

        if (userId !== currentPlayerId) {
            throw new Error('Invalid user')
        }

        const queue = this.buildResponseMessageQueue()
        const attackResult = Handler.attack(currentPlayerId, data)
        
        queue.add({ data: attackResult, type: ResponseType.ATTACK }, true)

        const game = GameController.getGame(data.gameId)

        if (!game) {
            throw new Error('Game not found')
        }

        if (game.status === GAME_STATUS.FINISHED) {
            const winners = Handler.updateScore()
            Handler.finishGame(game.id)

            queue.add({ data: winners, type: ResponseType.UPDATE_SCORE }, true)
        } else {
            const turn = Handler.buildTurnResponse(currentPlayerId)
            queue.add({ data: turn, type: ResponseType.PLAYER_TURN }, true)
        }

        return queue.result()
    }

    private randomAttack(userId: number, data: RequestData) {
        if (!('gameId' in data) || !('indexPlayer' in data)) {
            throw new Error(
                'Please provide required fields: gameId, indexPlayer'
            )
        }
        // return [
        //     'attackResponse',
        //     'turn - message for each client with current user id',
        // ]
        // // in case game is finished
        // return [
        //     'finish',
        //     'updateWinners',
        //     'clearRoom - do not send the message',
        // ]
        const currentPlayerId = data.indexPlayer

        if (userId !== currentPlayerId) {
            throw new Error('Invalid user')
        }

        const queue = this.buildResponseMessageQueue()
        const attackResult = Handler.randomAttack(currentPlayerId, data)

        queue.add({ data: attackResult, type: ResponseType.ATTACK }, true)

        const game = GameController.getGame(data.gameId)

        if (!game) {
            throw new Error('Game not found')
        }

        if (game.status === GAME_STATUS.FINISHED) {
            const winners = Handler.updateScore()
            Handler.finishGame(game.id)

            queue.add({ data: winners, type: ResponseType.UPDATE_SCORE }, true)
        } else {
            const turn = Handler.buildTurnResponse(currentPlayerId)
            queue.add({ data: turn, type: ResponseType.PLAYER_TURN }, true)
        }

        return queue.result()
    }
}

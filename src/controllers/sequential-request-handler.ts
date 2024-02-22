import { GAME_STATUS, RequestType, ResponseType } from '../constants'
import {
    InvalidRequestError,
    MissingRequiredFieldsError,
    NotFoundError,
} from '../custom-errors'
import { buildResponseMessageQueue } from '../helpers'
import { WsRequestMessage } from '../models'
import {
    isAddShipsRequestData,
    isAddUserToRoomRequestData,
    isAttackRequestData,
    isRandomAttackRequestData,
    isUserRequestData,
} from '../type-guards'
import { GameController } from './game.controller'
import * as handlers from './handlers'
import { RoomController } from './room.controller'

export class SequentialRequestHandler {
    private responseQueue: ResponseMessagesQueueBuilder

    handleRequestByType(
        request: WsRequestMessage<RequestData>,
        userId: number
    ) {
        this.responseQueue = buildResponseMessageQueue()
        const handler = this.getRequestHandlerByType(request.type)
        return handler(userId, request.data)
    }

    private getRequestHandlerByType: (
        type: RequestTypeValue
    ) => (userId: number, data: RequestData) => ResponseMessagesQueue = (
        type
    ) => {
        switch (type) {
            case RequestType.REGISTER:
                if (RoomController.getActiveRooms().length === 0) {
                    return this.createUserAndRoom.bind(this)
                } else {
                    return this.createUser.bind(this)
                }
            case RequestType.CREATE_ROOM:
                return this.createRoom.bind(this)
            case RequestType.ADD_USER_TO_ROOM:
                return this.addUserToActiveRoom.bind(this)
            case RequestType.ADD_SHIPS:
                return this.addShips.bind(this)
            case RequestType.ATTACK:
                return this.attack.bind(this)
            case RequestType.RANDOM_ATTACK:
                return this.randomAttack.bind(this)
            default:
                throw new InvalidRequestError()
        }
    }

    private createUser(
        userId: number,
        data: RequestData
    ): ResponseMessagesQueue {
        if (!isUserRequestData(data)) {
            throw new MissingRequiredFieldsError('name, password')
        }

        const user = handlers.createUser(userId, data)
        const activeRooms = handlers.getActiveRooms()
        const recepientsIds = handlers.getUpdateRoomRecepients()
        const score = handlers.updateScore()

        this.responseQueue.add({ data: user, type: ResponseType.REGISTER }, [
            userId,
        ])
        this.responseQueue.add(
            { data: activeRooms, type: ResponseType.UPDATE_ROOMS },
            recepientsIds
        )
        this.responseQueue.add(
            { data: score, type: ResponseType.UPDATE_SCORE },
            recepientsIds
        )

        return this.responseQueue.result()
    }

    private createRoom(userId: number): ResponseMessagesQueue {
        const activeRooms = handlers.createRoom(userId)

        this.responseQueue.add(
            { data: activeRooms, type: ResponseType.UPDATE_ROOMS },
            handlers.getUpdateRoomRecepients()
        )

        return this.responseQueue.result()
    }

    private createUserAndRoom(
        userId: number,
        data: RequestData
    ): ResponseMessagesQueue {
        if (!isUserRequestData(data)) {
            throw new MissingRequiredFieldsError('name, password')
        }

        const user = handlers.createUser(userId, data)
        const activeRooms = handlers.createRoom(userId)
        const score = handlers.updateScore()
        const recepientsIds = handlers.getUpdateRoomRecepients()

        this.responseQueue.add({ data: user, type: ResponseType.REGISTER }, [
            userId,
        ])
        this.responseQueue.add(
            { data: activeRooms, type: ResponseType.UPDATE_ROOMS },
            recepientsIds
        )
        this.responseQueue.add(
            { data: score, type: ResponseType.UPDATE_SCORE },
            recepientsIds
        )

        return this.responseQueue.result()
    }

    private addUserToActiveRoom(
        userId: number,
        data: RequestData
    ): ResponseMessagesQueue {
        if (!isAddUserToRoomRequestData(data)) {
            throw new MissingRequiredFieldsError('indexRoom')
        }

        const updatedRoom = handlers.addUserToRoom(userId, data.indexRoom)
        const [player1, player2] = updatedRoom.users
        const gameResponses = handlers.createGame(player1, player2)
        const activeRooms = handlers.getActiveRooms()
        const recepientsIds = handlers.getUpdateRoomRecepients()

        this.responseQueue.add(
            { data: activeRooms, type: ResponseType.UPDATE_ROOMS },
            recepientsIds
        )

        gameResponses.forEach((gameResponse) => {
            this.responseQueue.add(
                { data: gameResponse, type: ResponseType.CREATE_GAME },
                [gameResponse.idPlayer]
            )
        })

        return this.responseQueue.result()
    }

    private addShips(userId: number, data: RequestData): ResponseMessagesQueue {
        if (!isAddShipsRequestData(data)) {
            throw new MissingRequiredFieldsError(
                'gameId, ships and indexPlayer'
            )
        }

        if (userId !== data.indexPlayer) {
            throw new NotFoundError('user', userId)
        }

        const game = handlers.addShips(userId, data)

        if (game.status === GAME_STATUS.STARTED) {
            const secondPlayerId = game.getNextPlayerIndex(userId)!
            const gameStarted1 = handlers.startGame(userId, game.id)
            const gameStarted2 = handlers.startGame(secondPlayerId, game.id)
            const turn = handlers.buildTurnResponse(data.gameId, userId)

            this.responseQueue.add(
                { data: gameStarted1, type: ResponseType.START_GAME },
                [userId]
            )
            this.responseQueue.add(
                { data: gameStarted2, type: ResponseType.START_GAME },
                [secondPlayerId]
            )
            this.responseQueue.add(
                { data: turn, type: ResponseType.PLAYER_TURN },
                game.playersIds
            )
        }

        return this.responseQueue.result()
    }

    private attack(userId: number, data: RequestData) {
        if (!isAttackRequestData(data)) {
            throw new MissingRequiredFieldsError('gameId, x and y')
        }

        const game = GameController.getGame(data.gameId)

        if (userId !== data.indexPlayer) {
            throw new NotFoundError('user', userId)
        }

        if (!game) {
            throw new NotFoundError('game', data.gameId)
        }

        const playersIds = game.playersIds
        const attackResults = handlers.buildAttackResponse(userId, data)

        attackResults.forEach((attackResult) => {
            this.responseQueue.add(
                { data: attackResult, type: ResponseType.ATTACK },
                playersIds
            )
        })

        if (game.status === GAME_STATUS.FINISHED) {
            const winner = handlers.finishGame(data.gameId)
            const score = handlers.updateScore()

            this.responseQueue.add(
                { data: winner, type: ResponseType.FINISH_GAME },
                playersIds
            )
            this.responseQueue.add(
                { data: score, type: ResponseType.UPDATE_SCORE },
                playersIds
            )
        } else {
            const turn = handlers.buildTurnResponse(data.gameId, userId)

            this.responseQueue.add(
                { data: turn, type: ResponseType.PLAYER_TURN },
                playersIds
            )
        }

        return this.responseQueue.result()
    }

    private randomAttack(userId: number, data: RequestData) {
        if (!isRandomAttackRequestData(data)) {
            throw new MissingRequiredFieldsError('gameId, indexPlayer')
        }

        const x = Math.floor(Math.random() * 10)
        const y = Math.floor(Math.random() * 10)

        return this.attack(userId, { ...data, x, y })
    }
}

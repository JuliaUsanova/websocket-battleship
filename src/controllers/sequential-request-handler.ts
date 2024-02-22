import { GAME_STATUS, RequestType, ResponseType } from '../constants'
import { AttackStatus } from '../constants/constants'
import {
    DuplicatedUserInTheRoomError,
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

        const currentPlayerId = data.indexPlayer

        if (userId !== currentPlayerId) {
            throw new NotFoundError('user', currentPlayerId)
        }

        handlers.addShips(currentPlayerId, data)
        const game = GameController.getGame(data.gameId)

        if (!game) {
            throw new NotFoundError('game', data.gameId)
        }

        if (game?.status === GAME_STATUS.STARTED) {
            const secondPlayerId = game.getNextPlayerIndex(currentPlayerId)!
            const gameStarted1 = handlers.startGame(currentPlayerId)
            const gameStarted2 = handlers.startGame(secondPlayerId)
            const turn = handlers.buildTurnResponse(game, currentPlayerId)

            this.responseQueue.add(
                { data: gameStarted1, type: ResponseType.START_GAME },
                [currentPlayerId]
            )
            this.responseQueue.add(
                { data: gameStarted2, type: ResponseType.START_GAME },
                [secondPlayerId]
            )
            this.responseQueue.add(
                { data: turn, type: ResponseType.PLAYER_TURN },
                [currentPlayerId, secondPlayerId]
            )
        }

        return this.responseQueue.result()
    }

    private attack(userId: number, data: RequestData) {
        if (!isAttackRequestData(data)) {
            throw new MissingRequiredFieldsError('gameId, x and y')
        }

        const currentPlayerId = data.indexPlayer
        const game = GameController.getGame(data.gameId)

        if (userId !== currentPlayerId) {
            throw new NotFoundError('user', currentPlayerId)
        }

        if (!game) {
            throw new NotFoundError('game', data.gameId)
        }

        const attackResult = handlers.buildAttackResponse(currentPlayerId, data)
        const secondPlayerId = game.getNextPlayerIndex(currentPlayerId)

        if (game.killedShip) {
            game.killedShip.shipCells.forEach((cell) => {
                const attack = {
                    status: AttackStatus.KILLED,
                    position: cell,
                    currentPlayer: currentPlayerId,
                }
                this.responseQueue.add(
                    { data: attack, type: ResponseType.ATTACK },
                    [currentPlayerId, secondPlayerId]
                )
            })

            game.lastAffectedCells.forEach((cell) => {
                const attack = {
                    status: AttackStatus.MISS,
                    position: cell,
                    currentPlayer: currentPlayerId,
                }
                this.responseQueue.add(
                    { data: attack, type: ResponseType.ATTACK },
                    [currentPlayerId, secondPlayerId]
                )
            })
        } else {
            this.responseQueue.add(
                { data: attackResult, type: ResponseType.ATTACK },
                [currentPlayerId, secondPlayerId]
            )
        }

        if (game.status === GAME_STATUS.FINISHED) {
            const winner = handlers.finishGame(game.id)
            const winners = handlers.updateScore()

            this.responseQueue.add(
                { data: winner, type: ResponseType.FINISH_GAME },
                [currentPlayerId, secondPlayerId]
            )
            this.responseQueue.add(
                { data: winners, type: ResponseType.UPDATE_SCORE },
                [currentPlayerId, secondPlayerId]
            )
        } else {
            const turn = handlers.buildTurnResponse(game, currentPlayerId)
            this.responseQueue.add(
                { data: turn, type: ResponseType.PLAYER_TURN },
                [currentPlayerId, secondPlayerId]
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

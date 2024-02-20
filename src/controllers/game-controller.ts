import { WsRequestMessage, WsResponseMessage } from '../models'
import { Handlers, handleRequestByType } from './request-handler'
import { RequestType } from '../constants'
import {
    canStartPlaying,
    getActiveRoom,
    getGame,
    getLastHitCells,
} from './helpers'

export class GameController {
    static handleRequest(
        request: WsRequestMessage,
        id: number
    ): { message: WsResponseMessage; shouldUpdateAllClients: boolean }[] {
        const responseMessages = this.buildResponseMessageQueue()
        const type = request.type
        const response = handleRequestByType(request.type, request.data, id)
        responseMessages.add(response, false)

        // // Handle sequential responses
        if (type === RequestType.REGISTER) {
            const activeRoom = getActiveRoom()

            if (activeRoom) {
                const addUserToRoomResponse = Handlers.addUserToRoom(id, {
                    indexRoom: activeRoom.roomId,
                })
                const createGameResponse = Handlers.createGame(id)

                responseMessages.add(addUserToRoomResponse, true)
                responseMessages.add(createGameResponse, true)
            } else {
                const createRoomResponse = Handlers.createRoom(id)
                responseMessages.add(createRoomResponse, true)
            }

            const updateScoreResponse = Handlers.updateScore()
            responseMessages.add(updateScoreResponse, true)
        } else if (type === RequestType.ADD_SHIPS && canStartPlaying(id)) {
            const startGameResponse = Handlers.startGame(id)
            const turnResponse = Handlers.buildTurnResponse(id)

            responseMessages.add(startGameResponse, true)
            responseMessages.add(turnResponse, true)
        } else if (type === RequestType.ATTACK) {
            const attackResult = getLastHitCells(id)
            if (attackResult && attackResult.length > 1) {
                const game = getGame(id)
                attackResult.forEach((result) => {
                    const attackResponse = Handlers.buildAttackResponse(
                        id,
                        result,
                        game
                    )
                    responseMessages.add(attackResponse, true)
                })
            }
            const turnResponse = Handlers.buildTurnResponse(id)
            responseMessages.add(turnResponse, true)
        }

        return responseMessages.result()
    }

    static buildResponseMessageQueue: () => {
        add: (
            message: ResponseMessage<ResponseData> | void,
            shouldUpdateAllClients: boolean
        ) => void
        result: () => {
            message: WsResponseMessage
            shouldUpdateAllClients: boolean
        }[]
    } = () => {
        const messages: {
            message: WsResponseMessage
            shouldUpdateAllClients: boolean
        }[] = []

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
}

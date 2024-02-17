import { ResponseType } from '../constants'
import { Score, WsRequestMessage, WsResponseMessage } from '../models'
import { Database } from '../db'
import { handleRequestByType } from './request-handler'
import { RequestType } from '../constants/constants';

export class GameController {
    static handleRequest(
        request: WsRequestMessage, id: number
    ): { message: WsResponseMessage; shouldUpdateAllClients: boolean }[] {
        const responseMessages = []
        const responseMessage = handleRequestByType(request.type, request.data, id)

        responseMessages.push({
            message: new WsResponseMessage(responseMessage),
            shouldUpdateAllClients: false,
        })

        if (request.type === RequestType.REGISTER) {
            const updateRoomsMsg = new WsResponseMessage({
                type: ResponseType.UPDATE_ROOMS,
                data: Database.getRooms(),
            })

            const updateScoreMsg = new WsResponseMessage({
                type: ResponseType.UPDATE_SCORE,
                data: Score.total,
            })

            responseMessages.push({
                message: updateRoomsMsg,
                shouldUpdateAllClients: true,
            })
            responseMessages.push({
                message: updateScoreMsg,
                shouldUpdateAllClients: true,
            })
        }

        return responseMessages
    }
}

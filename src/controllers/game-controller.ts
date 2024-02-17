import { WsRequestMessage, WsResponseMessage } from '../models'
import { Handlers, handleRequestByType } from './request-handler'
import { RequestType } from '../constants/constants'

export class GameController {
    static handleRequest(
        request: WsRequestMessage,
        id: number
    ): { message: WsResponseMessage; shouldUpdateAllClients: boolean }[] {
        const responseMessage = handleRequestByType(
            request.type,
            request.data,
            id
        )

        const responseMessages = [
            {
                message: new WsResponseMessage(responseMessage),
                shouldUpdateAllClients: false,
            },
        ]

        if (request.type === RequestType.REGISTER) {
            responseMessages.push({
                message: new WsResponseMessage(Handlers.createRoom(id)),
                shouldUpdateAllClients: true,
            })
            responseMessages.push({
                message: new WsResponseMessage(Handlers.updateScore()),
                shouldUpdateAllClients: true,
            })
        }

        return responseMessages
    }
}

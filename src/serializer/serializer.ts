import { WsRequestMessage, WsResponseMessage } from '../models'
import { isValidRequest } from '../type-guards'

export class Serializer {
    static serialize(response: WsResponseMessage): string {
        return JSON.stringify({
            type: response.result.type,
            data: response.result.data,
            id: response.result.id,
        })
    }

    static deserialize(
        request: Buffer | ArrayBuffer | Buffer[]
    ): WsRequestMessage {
        const { type, data } = JSON.parse(request.toString())

        // TODO: THIS ERROR CRASHES THE SERVER
        if (!isValidRequest({ type, data })) {
            throw new Error('Invalid request type')
        }

        const parseData = data.length ? JSON.parse(data) : {}

        return new WsRequestMessage({ type, data: parseData })
    }
}

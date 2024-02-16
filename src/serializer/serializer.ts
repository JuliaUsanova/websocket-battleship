import { WsRequestMessage, WsResponseMessage } from '../models'
import { isWsResponseMessage } from '../type-guards'

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

        if (!isWsResponseMessage({ type, data })) {
            throw new Error('Invalid request type')
        }

        const parseData = JSON.parse(data)

        return new WsRequestMessage({ type, data: parseData })
    }
}

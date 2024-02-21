import { WsResponseMessage } from '../models'

export const buildResponseMessageQueue: () => ResponseMessagesQueueBuilder =
() => {
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
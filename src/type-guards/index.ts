import { ResponseTypeValues } from '../constants'
import { WsResponseMessage } from '../models'
import { User } from '../models/user'

export const isUser = (data: any): data is User => {
    return data.name && data.password
}

export const isWsResponseMessage = (
    response: any
): response is WsResponseMessage => {
    return (
        response &&
        response.type &&
        ResponseTypeValues.includes(response.type) &&
        typeof response.data === 'string'
    )
}

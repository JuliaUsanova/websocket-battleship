import { ResponseTypeValues } from '../constants'
import { RequestTypeValues } from '../constants/constants'
import { WsRequestMessage, WsResponseMessage } from '../models'
import { User } from '../models/user'

export const isUser = (data: any): data is User => {
    return data.name && data.password
}

export const isValidResponse = (
    response: any
): response is typeof WsResponseMessage => {
    return (
        response &&
        response.type &&
        ResponseTypeValues.includes(response.type) &&
        typeof response.data === 'string'
    )
}

export const isValidRequest = (
    request: any
): request is typeof WsRequestMessage => {
    return (
        request &&
        request.type &&
        RequestTypeValues.includes(request.type) &&
        typeof request.data === 'string'
    )
}

import { ResponseTypeValues } from '../constants'
import { RequestTypeValues } from '../constants/constants'
import { DuplicatedUserInTheRoomError, InvalidRequestError, MissingRequiredFieldsError, NotFoundError } from '../custom-errors'
import { WsRequestMessage, WsResponseMessage } from '../models'

export const isUserRequestData = (
    data: RequestData
): data is UserRequestData => {
    return 'name' in data && 'password' in data
}

export const isAddUserToRoomRequestData = (
    data: RequestData
): data is AddUserToRoomRequestData => {
    return 'indexRoom' in data
}

export const isAddShipsRequestData = (
    data: RequestData
): data is AddShipsRequestData => {
    return 'gameId' in data && 'ships' in data && 'indexPlayer' in data
}

export const isAttackRequestData = (
    data: RequestData
): data is AttackRequestData => {
    return (
        'gameId' in data && 'x' in data && 'y' in data && 'indexPlayer' in data
    )
}

export const isRandomAttackRequestData = (
    data: RequestData
): data is RandomAttackRequestData => {
    return 'gameId' in data && 'indexPlayer' in data
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

export const isCustomError = (
    error: unknown
): error is
    | NotFoundError
    | DuplicatedUserInTheRoomError
    | MissingRequiredFieldsError
    | InvalidRequestError => {
    return (
        error instanceof NotFoundError ||
        error instanceof DuplicatedUserInTheRoomError ||
        error instanceof MissingRequiredFieldsError ||
        error instanceof InvalidRequestError
    )
}

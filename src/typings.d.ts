// REQUEST
declare type RequestData =
    | Record<string, string | number | boolean | null>
    | UserRequestData

declare type UserRequestData = {
    name: string
    password: number
}

declare type RequestMessage<T extends RequestData> = {
    type: ResponseTypeValue
    data: T
}

declare type RequestTypeValue =
    (typeof import('./constants').RequestTypeValues)[number]

// RESPONSE
declare type ResponseData =
    | UserResponseData
    | RoomResponseData[]
    | ScoreResponseData[]

declare type ResponseMessage<T extends ResponseData> = {
    type: ResponseTypeValue
    data: T
}

declare type UserResponseData = {
    name: string
    index: number
    error: number
    errorText: string | null
}

declare type RoomResponseData = {
    roomId: number
    roomUsers: Pick<User, 'index', 'name'>[]
}

declare type ScoreResponseData = {
    name: string
    wins: number
}

declare type ResponseTypeValue =
    (typeof import('./constants').ResponseTypeValues)[number]

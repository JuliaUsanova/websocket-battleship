// REQUEST
declare type RequestData =
    | Record<string, string | number | boolean | null>
    | UserRequestData

declare type UserRequestData = {
    name: string
    password: number
}

declare type RequestMessage<T extends RequestData> = {
    type: (typeof ResponseTypeValues)[number]
    data: T
}

// RESPONSE
declare type ResponseData =
    | UserResponseData
    | RoomResponseData[]
    | ScoreResponseData[]

declare type ResponseMessage<T extends ResponseData> = {
    type: (typeof ResponseTypeValues)[number]
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
    roomUsers: UserResponseData[]
}

declare type ScoreResponseData = {
    name: string
    wins: number
}

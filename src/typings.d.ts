// REQUEST
// TODO: CLEAN UP RequestData
declare type RequestData =
    | UserRequestData
    | AddUserToRoomData
    | AddShipsRequestData

declare type UserRequestData = {
    name: string
    password: number
}

declare type AddUserToRoomData = {
    indexRoom: number
}

declare type AddShipsRequestData = {
    gameId: number
    ships: import('./models').Ship[]
    indexPlayer: number
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
    | CreateGameResponseData
    | StartGameResponseData

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

declare type CreateGameResponseData = {
    gameId: number
    playerId: number
}

declare type StartGameResponseData = {
    ships: import('./models').Ship[]
    currentPlayerIndex: number
}

declare type ResponseTypeValue =
    (typeof import('./constants').ResponseTypeValues)[number]

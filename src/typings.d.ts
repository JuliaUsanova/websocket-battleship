// REQUEST
// TODO: CLEAN UP RequestData
declare type RequestData =
    | UserRequestData
    | AddUserToRoomRequestData
    | AddShipsRequestData
    | AttackRequestData
    | RandomAttackRequestData

declare type UserRequestData = {
    name: string
    password: string
}

declare type AddUserToRoomRequestData = {
    indexRoom: number
}

declare type AddShipsRequestData = {
    gameId: number
    ships: import('./models').Ship[]
    indexPlayer: number
}

declare type AttackRequestData = {
    gameId: number
    x: number
    y: number
    indexPlayer: number
}

declare type RandomAttackRequestData = {
    gameId: number
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
    | AttackResponse
    | PlayerTurnResponse
    | FinishGameResponseData

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
    roomUsers: { name: string; index: number }[]
}

declare type ScoreResponseData = {
    name: string
    wins: number
}

declare type CreateGameResponseData = {
    idGame: number
    idPlayer: number
}

declare type StartGameResponseData = {
    ships: import('./models').Ship[]
    currentPlayerIndex: number
}

declare type AttackResponse = {
    position: {
        x: number
        y: number
    }
    currentPlayer: number
    status: 'miss' | 'killed' | 'shot'
}

declare type PlayerTurnResponse = {
    currentPlayer: number
}

declare type FinishGameResponseData = {
    winPlayer: number
}

declare type ResponseTypeValue =
    (typeof import('./constants').ResponseTypeValues)[number]

declare type ResponseMessagesQueue = {
    message: WsResponseMessage
    recepientsIds: number[]
}[]

declare type ResponseMessagesQueueBuilder = {
    add: (
        message: ResponseMessage<ResponseData>,
        recepientsIds: number[]
    ) => void
    result: () => ResponseMessagesQueue
}

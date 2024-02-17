declare type RequestData =
    | Record<string, string | number | boolean | null>
    | UserResponseData
    | RoomResponseData[]
    | ScoreResponseData[]

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

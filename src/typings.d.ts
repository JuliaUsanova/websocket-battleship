declare type RequestData = Record<string, string | number | boolean | null> | UserResponseData

declare type UserResponseData = {
    name: string
    index: number
    error: number
    errorText: string | null
}
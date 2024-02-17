export enum UserResponseType {
    REGISTER = 'reg',
}

export enum GameResponseType {
    CREATE_GAME = 'create_room',
    START_GAME = 'start_game',
    PLAYER_TURN = 'turn',
    ATTACK = 'attack',
    FINISH_GAME = 'finish',
}

export enum GeneralResponseType {
    UPDATE_ROOMS = 'update_room',
    UPDATE_SCORE = 'update_winners',
}

export const ResponseType = {
    ...UserResponseType,
    ...GameResponseType,
    ...GeneralResponseType,
}

export const ResponseTypeValues = Object.values(ResponseType)


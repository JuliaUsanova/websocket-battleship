export enum UserResponseType {
    REGISTER = 'reg',
}

export enum GameResponseType {
    CREATE_GAME = 'create_game',
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

export enum UserRequestType {
    REGISTER = 'reg',
}

export enum RoomRequestType {
    CREATE_ROOM = 'create_room',
    ADD_USER_TO_ROOM = 'add_user_to_room',
}

export enum GameRequestType {
    ADD_SHIPS = 'add_ships',
    ATTACK = 'attack',
    RANDOM_ATTACK = 'random_attack',
}

export const RequestType = {
    ...UserRequestType,
    ...RoomRequestType,
    ...GameRequestType,
}

export const RequestTypeValues = Object.values(RequestType)

export enum AttackStatus {
    MISS = 'miss',
    KILLED = 'killed',
    SHOT = 'shot',
}

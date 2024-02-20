import { Database } from '../db'

export const getUserRoom = (userId: number) => {
    return Database.getRoomByUserId(userId)
}

export const isRoomFull = (roomId: number) => {
    const room = Database.getRoom(roomId)
    return room?.users.length === 2
}

export const canStartPlaying = (userId: number) => {
    const game = Database.getActiveGameByUserId(userId)
    return game?.status === 'started'
}

export const getLastHitCells = (userId: number) => {
    const game = Database.getActiveGameByUserId(userId)
    return game?.lastAffectedCells
}

export const getGame = (userId: number) => {
    return Database.getActiveGameByUserId(userId)
}

export const getActiveRoom = () => {
    return Database.getRooms().find((r) => r.roomUsers.length > 0)
}

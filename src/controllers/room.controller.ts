import { Room } from '../models'

export class RoomController {
    private static rooms = new Map<number, Room>()

    static addRoom(room: Room) {
        RoomController.rooms.set(room.roomId, room)
    }

    static getRoom(roomId: number) {
        return RoomController.rooms.get(roomId)
    }

    static getActiveRooms() {
        return Array.from(RoomController.rooms.values()).filter(
            (r) => r.users.length < 2
        )
    }

    static getRooms() {
        return Array.from(RoomController.rooms.values())
    }

    static saveRoom(room: Room) {
        RoomController.rooms.set(room.roomId, room)
    }

    static getActiveRoomByUserId(userId: number): Room | undefined {
        return RoomController.getRooms()
            .filter(({ games }) => games.length === 0)
            .find((room) => room.hasUser(userId))
    }

    static getRoomByGameId(gameId: number): Room | undefined {
        return RoomController.getRooms().find((room) =>
            room.games.includes(gameId)
        )
    }
}

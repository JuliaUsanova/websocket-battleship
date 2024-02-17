import { Room, User } from '../models'

const users: User[] = []
const winners: string[] = []
const rooms: Room[] = []

export class Database {
    // TODO: SHOULD DB STORE ERRORS?
    static addUser(data: User): User {
        if (
            users.find(
                (user) =>
                    user.name === data.name && user.password === data.password
            )
        ) {
            data.setError('User already exists')
        }
        users.push(data)
        return data
    }

    static getUser(index: number): User | undefined {
        return users.find((user) => user.index === index)
    }

    static addWinner(name: string) {
        winners.push(name)
    }

    static getWinners() {
        return winners
    }

    static addRoom(room: Room) {
        rooms.push(room)
    }

    static getRooms() {
        return rooms.map((room) => ({
            roomId: room.roomId,
            roomUsers: room.roomUsers.map((user) => ({
                index: user.index,
                name: user.name,
            })),
        }))
    }
}

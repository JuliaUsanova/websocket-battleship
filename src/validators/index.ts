import { User } from '../models'
import { Room } from '../models/room'

const users: User[] = []
const winners: string[] = []
const rooms: Room[] = []

export class Database {
    // TODO: SHOULD DB STORE ERRORS?
    static addUser(data: User): User {
        const user = new User(data)
        if (
            users.find(
                (user) =>
                    user.name === data.name && user.password === data.password
            )
        ) {
            user.setError('User already exists')
        }
        users.push(user)
        return user
    }

    static getUser(index: number): User | undefined {
        return users.find((user) => user.index === index)
    }

    static getAllUsers() {
        return users
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
        return rooms
    }
}

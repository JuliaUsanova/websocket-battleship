import { User } from '../models'

const users: User[] = []
const winners: string[] = []
const rooms: string[] = []

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

    static getUser(name: string) {
        return users.find((user) => user.name === name)
    }

    static addWinner(name: string) {
        winners.push(name)
    }

    static getWinners() {
        return winners
    }

    static addRoom(room: string) {
        rooms.push(room)
    }

    static getRooms() {
        return rooms
    }
}

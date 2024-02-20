import { Game, Room, User } from '../models'

const users: User[] = []
const winners: string[] = []
const rooms: Room[] = []
const games: Game[] = []

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

    static saveUser(user: User) {
        const index = users.findIndex((u) => u.index === user.index)
        users[index] = user
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

    static getRoom(index: number): Room | undefined {
        return rooms.find((room) => room.roomId === index)
    }

    static saveRoom(room: Room) {
        const index = rooms.findIndex((r) => r.roomId === room.roomId)
        rooms[index] = room
    }

    static getRooms() {
        return rooms
            .filter((r) => r.users.length < 2)
            .map((room) => ({
                roomId: room.roomId,
                roomUsers: room.users,
            }))
    }

    static saveGame(game: Game) {
        const index = games.findIndex((g) => g.id === game.id)
        if (index === -1) {
            games.push(game)
        } else {
            games[index] = game
        }
        return game
    }

    static getRoomByUserId(index: number): Room | undefined {
        return rooms.find((room) =>
            room.users.find((user) => user.index === index)
        )
    }

    // TODO: FILTER BY GAME STATUS
    static getFinishedGamesByUserId(index: number): Game[] {
        return games.filter((game) => game.hasPlayer(index) && game.status === 'finished')
    }

    static getActiveGameByUserId(index: number): Game | undefined {
        return games
            .filter(({ status }) => status !== 'finished')
            .find((game) => game.hasPlayer(index))
    }
}

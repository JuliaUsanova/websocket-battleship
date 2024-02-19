import { User } from './user'

export class Room {
    private roomUsers: User[] = []
    private games: number[] = []
    roomId: number = Date.now()

    get users() {
        return this.roomUsers.map((user) => ({
            index: user.index,
            name: user.name,
        }))
    }

    addUser(user: User) {
        this.roomUsers.push(user)
    }

    addGameId(gameId: number) {
        this.games.push(gameId)
    }

    hasUser(userId: number) {
        return this.roomUsers.find((user) => user.index === userId)
    }
}

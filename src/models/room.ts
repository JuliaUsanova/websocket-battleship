import { User } from './user'

export class Room {
    roomId: number = Date.now()
    roomUsers: User[] = []
    games: number[] = []

    addUser(user: User) {
        this.roomUsers.push(user)
    }

    addGameId(gameId: number) {
        this.games.push(gameId)
    }

    getUsers() {
        return this.roomUsers
    }
}

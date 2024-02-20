export class Room {
    private roomUsers: number[] = []
    games: number[] = []
    roomId: number = Date.now()

    get users() {
        return this.roomUsers
    }

    addUser(userId: number) {
        this.roomUsers.push(userId)
    }

    addGameId(gameId: number) {
        this.games.push(gameId)
    }

    hasUser(userId: number) {
        return this.roomUsers.find((index) => index === userId)
    }

    clear() {
        this.roomUsers = []
        this.games = []
    }
}

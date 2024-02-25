export class Room {
    private roomUserIds: number[] = []
    games: number[] = []
    roomId: number = Date.now()

    get users() {
        return this.roomUserIds
    }

    addUser(userId: number) {
        this.roomUserIds.push(userId)
    }

    addGameId(gameId: number) {
        this.games.push(gameId)
    }

    hasUser(userId: number) {
        return this.roomUserIds.find((index) => index === userId)
    }
}

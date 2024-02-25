export class User {
    name: string
    password: string
    index: number
    games: number[] = []
    rooms: number[] = []

    constructor({ name, password, id }: { name: string; password: string, id: number}) {
        this.name = name
        this.password = password
        this.index = id
    }

    get meta() {
        return {
            name: this.name,
            index: this.index,
        }
    
    }

    addRoom(roomId: number) {
        this.rooms.push(roomId)
    }

    addGame(gameId: number) {
        this.games.push(gameId)
    }
}

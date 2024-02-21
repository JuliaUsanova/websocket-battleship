export class User {
    name: string
    password: string
    index: number
    games: number[] = []

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

    addGame(gameId: number) {
        this.games.push(gameId)
    }
}

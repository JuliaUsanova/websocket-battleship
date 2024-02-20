export class User {
    name: string
    password: string
    index: number
    error: number = 0
    errorText: string | null = null
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
            error: this.error,
            errorText: this.errorText,
        }
    
    }
    
    setError(error: string) {
        this.error = error ? 1 : 0
        this.errorText = error
    }

    addGame(gameId: number) {
        this.games.push(gameId)
    }
}

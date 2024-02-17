export class User {
    name: string
    password: string
    index: number
    error: number = 0
    errorText: string | null = null

    constructor({ name, password, id }: { name: string; password: string, id: number}) {
        this.name = name
        this.password = password
        this.index = id
    }

    setError(error: string) {
        this.error = error ? 1 : 0
        this.errorText = error
    }
}

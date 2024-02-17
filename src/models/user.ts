export class User {
    name: string
    password: string
    index: number
    error: number = 0
    errorText: string | null = null

    constructor({ name, password }: { name: string; password: string }) {
        this.name = name
        this.password = password
        this.index = Date.now()
    }

    setError(error: string) {
        this.error = error ? 1 : 0
        this.errorText = error
    }
}

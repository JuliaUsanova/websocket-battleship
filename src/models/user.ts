export class User {
    name: string
    password: string
    id: string
    isPlaying: boolean

    constructor({ name, password }: { name: string; password: string }) {
        this.name = name
        this.password = password
        this.id = Date.now().toString()
        this.isPlaying = false
    }
}

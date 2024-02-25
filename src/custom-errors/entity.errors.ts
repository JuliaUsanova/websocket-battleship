

export class NotFoundError extends Error {
    constructor(resource: string, id?: string | number) {
        const message = id ? `Resource ${resource} with ${id} not found!` : `Resource ${resource} not found!`
        super(message)

        this.name = this.constructor.name

        Error.captureStackTrace(this, this.constructor)
    }
}

export class DuplicatedUserInTheRoomError extends Error {
    constructor(name: string) {
        super(`User with name '${name}' already exists in the room!`)

        this.name = this.constructor.name

        Error.captureStackTrace(this, this.constructor)
    }
}
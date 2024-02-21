export class MissingRequiredFieldsError extends Error {
    constructor(message: string) {
        super(`Invalid request data! Please provide required fields: ${message}`)

        this.name = this.constructor.name

        Error.captureStackTrace(this, this.constructor)
    }
}

export class InvalidRequestError extends Error {
    constructor() {
        super(`Invalid request data!`)

        this.name = this.constructor.name

        Error.captureStackTrace(this, this.constructor)
    }
}
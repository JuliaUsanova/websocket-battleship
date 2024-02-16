export class ResponseMessage {
    _type: string
    _data: string
    id = 0

    set type(value: string) {
        this.type = value
    }

    set data(value: Record<string, string>) {
        this._data = JSON.stringify(value)
    }

    get result() {
        return JSON.stringify({
            type: this._type,
            data: this._data,
            id: this.id,
        })
    }
}

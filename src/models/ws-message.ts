import { ResponseTypeValues } from '../constants'

export class WsResponseMessage {
    private _type: string
    private _data: string
    private _id = 0

    constructor({
        type,
        data,
    }: {
        type: string
        data: Record<string, string>
    }) {
        this._type = type
        this._data = JSON.stringify(data)
    }

    get result() {
        return {
            type: this._type,
            data: this._data,
            id: this._id,
        }
    }
}
export class WsRequestMessage {
    private _type: (typeof ResponseTypeValues)[number]
    private _data: Record<string, string>
    constructor({
        type,
        data,
    }: {
        type: (typeof ResponseTypeValues)[number]
        data: Record<string, string>
    }) {
        this._type = type
        this._data = data
    }

    get type() {
        return this._type
    }

    get data() {
        return this._data
    }
}

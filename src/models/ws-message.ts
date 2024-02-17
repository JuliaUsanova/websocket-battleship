// TODO: ADD GENERIC TYPES
export class WsResponseMessage {
    private _type: ResponseTypeValue
    private _data: string
    private _id = 0

    constructor({
        type,
        data,
    }: {
        type: ResponseTypeValue
        data: ResponseData
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
    private _type: RequestTypeValue
    private _data: RequestData
    constructor({
        type,
        data,
    }: {
        type: RequestTypeValue
        data: RequestData
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

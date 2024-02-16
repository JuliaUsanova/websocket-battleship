import { WebSocket, WebSocketServer } from 'ws'
import { Serializer } from '../serializer'
import { handleRequest } from '../controllers'

export class WebSocketServerBattleShip {
    private wsServer: WebSocketServer

    public start(port: number) {
        this.wsServer = new WebSocketServer({ port })

        this.wsServer.on('connection', (ws, request) => {
            console.log(
                `Websocket is created on port ${port}! WS address: ${request.headers.host}`
            )

            this.addListeners(ws)
            this.addErrorListeners(ws)
        })
    }

    public closeAllConnections() {
        this.wsServer.clients.forEach((client) => {
            if (client.readyState === 1) {
                this.closeWSConnection(client)
            }
        })

        this.wsServer.close()
    }

    private closeWSConnection(
        wsClient: WebSocket,
        code?: number,
        reason?: Buffer | string
    ) {
        console.log(
            `connection closed by server! code: ${code}, reason: ${reason}`
        )
        wsClient.send('connection closed by server!')
        wsClient.terminate()
    }

    private addErrorListeners(ws: WebSocket) {
        ws.on('wsClientError', (error) => {
            console.error('wsClientError', error)
            this.closeAllConnections()
        })

        ws.on('unexpected-response', (response) => {
            console.error('unexpected-response ', response)
            this.closeAllConnections()
        })

        ws.on('error', (error) => {
            console.log('websocket error ', error)
            this.closeAllConnections()
        })
    }

    private addListeners(ws: WebSocket) {
        ws.on('message', (data) => {
            // TODO: LOG EVERY RECEIVED MESSAGE
            console.log(`message: ${data}`)

            try {
                const request = Serializer.deserialize(data)
                const result = handleRequest(request.type, request.data)
                ws.send(Serializer.serialize(result));

                // ws.send(
                //     JSON.stringify({
                //         type: 'reg',
                //         data: JSON.stringify({
                //             name: 'Jus',
                //             password: '12345',
                //         }),
                //         id: 0,
                //     })
                // )
            } catch (error) {
                console.error('Error on message', error)
                this.closeAllConnections()
            }
        })

        ws.on('close', (code, reason) => {
            this.closeWSConnection(ws, code, reason)
            this.closeAllConnections()
        })
    }
}

import { WebSocket, WebSocketServer } from 'ws'
import { Serializer } from '../serializer'
import { SequentialRequestHandler } from '../controllers'

export class WebSocketServerBattleShip {
    private wsServer: WebSocketServer
    private requestHandler = new SequentialRequestHandler()

    public start(port: number) {
        this.wsServer = new WebSocketServer({ port })

        this.wsServer.on('connection', (ws, request) => {
            const id = Date.now()

            console.log(
                `Websocket is created on port ${port}! WS address: ${request.headers.host}, ws id: ${id}`
            )

            this.addListeners(ws, id)
            this.addErrorListeners(ws, id)
        })
    }

    public closeAllConnections(code?: number, reason?: string) {
        this.wsServer.clients.forEach((client) => {
            if (client.readyState === 1) {
                this.closeWSConnection(client, code, reason)
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

    private addErrorListeners(ws: WebSocket, id: number) {
        ws.on('wsClientError', (error) => {
            console.error(`wsClientError for ws ${id}`, error)
            this.closeAllConnections()
        })

        ws.on('unexpected-response', (response) => {
            console.error(`unexpected-response for ws ${id} `, response)
            this.closeAllConnections()
        })

        ws.on('error', (error) => {
            console.log(`websocket ${id} error `, error)
            this.closeAllConnections()
        })
    }

    private addListeners(ws: WebSocket, id: number) {
        ws.on('message', (data) => {
            // TODO: LOG EVERY RECEIVED MESSAGE
            console.log(`message: ${data}`)

            try {
                const request = Serializer.deserialize(data)
                const responseMessages =
                    this.requestHandler.handleRequestByType(request, id)

                // TODO: PASS CLIENT ID INSTEAD OF shouldUpdateAllClients, AND TO SEND MESSAGE, LOOK FOR PARTICULAR CLIENT
                responseMessages.forEach(
                    ({ message, shouldUpdateAllClients }) => {
                        ws.send(Serializer.serialize(message))

                        if (shouldUpdateAllClients) {
                            this.wsServer.clients.forEach((client) => {
                                if (client !== ws && client.readyState === 1) {
                                    client.send(Serializer.serialize(message))
                                }
                            })
                        }
                    }
                )
            } catch (error) {
                console.error('Error on message', error)
                this.closeAllConnections(500, JSON.stringify(error))
            }
        })

        ws.on('close', (code, reason) => {
            this.closeWSConnection(ws, code, reason)
        })
    }
}

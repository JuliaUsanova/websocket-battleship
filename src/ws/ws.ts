import { WebSocket, WebSocketServer } from 'ws'

export const openWSConnection = (port: number) => {
    const wsServer = new WebSocketServer({ port })

    wsServer.on('connection', (ws, request) => {
        console.log(
            `Websocket is created on port ${port}! WS address: ${request.headers.host}`
        )

        ws.on('close', (code, reason) => {
            closeWSConnection(ws, code, reason)
            closeAllConnections(wsServer)
        })

        ws.on('message', (data) => {
            // TODO: LOG EVERY RECEIVED MESSAGE
            console.log(`message: ${data}`)

            ws.send(
                JSON.stringify({
                    type: 'reg',
                    data: JSON.stringify({ name: 'Jus', password: '12345' }),
                    id: 0,
                })
            )
        })

        ws.on('wsClientError', (error) => {
            console.error('wsClientError', error)
            closeAllConnections(wsServer)
        })

        ws.on('unexpected-response', (response) => {
            console.error('unexpected-response ', response)
            closeAllConnections(wsServer)
        })

        ws.onerror = function (error) {
            console.log('websocket error ', error)
            closeAllConnections(wsServer)
        }
    })
}

function closeAllConnections(wsServer: WebSocketServer) {
    wsServer.clients.forEach((client) => {
        if (client.readyState === 1) {
            closeWSConnection(client)
        }
    })

    wsServer.close()
}

// TODO: move to the separate file
// TODO: add code and reason to the response
function closeWSConnection(ws: WebSocket, code?: number, reason?: Buffer | string) {
    console.log(`connection closed by server! code: ${code}, reason: ${reason}`)
    ws.send('connection closed by server!')
    ws.terminate()
}

import { httpServer } from './src/http_server/index.js'
import { WebSocketServerBattleShip } from './src/ws/index.js'

const HTTP_PORT = 8181
const WS_PORT = 3000

const game = new WebSocketServerBattleShip()
const exitHandler = (code?: number, reason?: string) => {
    console.log('HTTP Server is closed!')
    game.closeAllConnections(code, reason)
    console.log('Websocket server is closed!')
}

console.log(`Start static http server on the ${HTTP_PORT} port!`)
httpServer
    .listen(HTTP_PORT)
    .on('listening', () => {
        console.log('HTTP Server is running on http://localhost:' + HTTP_PORT)
        game.start(WS_PORT)
    })
    .on('clientError', (err) => {
        debugger
        console.error('HTTP Server clientError', err)
        exitHandler(500, JSON.stringify(err))
    })
    .on('close', exitHandler)

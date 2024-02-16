import { httpServer } from './src/http_server/index.js'
import { WebSocketServerBattleShip } from './src/ws/index.js'

const HTTP_PORT = 8181
const WS_PORT = 3000

const game = new WebSocketServerBattleShip()

console.log(`Start static http server on the ${HTTP_PORT} port!`)
httpServer
    .listen(HTTP_PORT)
    .on('listening', () => {
        console.log('HTTP Server is running on http://localhost:' + HTTP_PORT)

        game.start(WS_PORT)
    })
    .on('close', () => {
        console.log('HTTP Server is closed!')

        game.closeAllConnections()

        console.log('Websocket server is closed!')
    })

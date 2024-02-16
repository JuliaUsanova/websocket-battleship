import { httpServer } from './src/http_server/index.js'
import { openWSConnection } from './src/ws/index.js'

const HTTP_PORT = 8181
const WS_PORT = 3000

console.log(`Start static http server on the ${HTTP_PORT} port!`)
httpServer.listen(HTTP_PORT).on('listening', () => {
    console.log('HTTP Server is running on http://localhost:' + HTTP_PORT)

    openWSConnection(WS_PORT)
})

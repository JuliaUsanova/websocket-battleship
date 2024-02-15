import * as fs from 'node:fs'
import * as path from 'node:path'
import * as http from 'node:http'
import { WebSocketServer } from 'ws'

export const httpServer = http.createServer(function (req, res) {
    const __dirname = path.resolve(path.dirname(''))
    const file_path =
        __dirname + (req.url === '/' ? '/front/index.html' : '/front' + req.url)
    fs.readFile(file_path, function (err, data) {
        if (err) {
            res.writeHead(404)
            res.end(JSON.stringify(err))
            return
        }
        res.writeHead(200)
        res.end(data)
    })
})

const wsServer = new WebSocketServer({ port: 3000 })
wsServer.on('connection', (ws) => {
    console.log('client connected!')
    ws.send('connection established')
    ws.on('close', () => console.log('Client has disconnected!'))
    ws.on('message', (data) => {
        console.log(`message: ${data}`)
    })
    ws.onerror = function () {
        console.log('websocket error')
    }
})

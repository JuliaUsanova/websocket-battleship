# RSSchool NodeJS websocket task template
> Static http server and base task packages. 
> By default WebSocket client tries to connect to the 3000 port.

## Game description

Player can create game room or connect to the game room after login
Game starts after 2 players are connected to the room and sent ships positions to the server
Players should shoot in their's turn
If player hits or kills the ship, player should make one more shoot
Player wins if he have killed all enemies ships

## Usage
**Development**

`npm run start:dev`

* App served @ `http://localhost:8181` with nodemon

**Production**

`npm run start`

* App served @ `http://localhost:8181` without nodemon

---

**Notes**

Bot mode is not implemented.

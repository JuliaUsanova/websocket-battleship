import { Ship } from './'

let id = 0;

export class Game {
    id: number;
    ships: Ship[];
    playerIndex: number;
    roomid: number;

    constructor(roomId: number, playerIndex: number) {
        this.roomid = roomId;
        this.ships = [];
        this.playerIndex = playerIndex;
        this.id = id++;
    }

    addShips(ships: Ship[]) {
        this.ships = ships;
    }
}
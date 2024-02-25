import { GAME_STATUS } from '../constants'
import { Game } from '../models'

export class GameController {
    private static games: Game[] = []

    static addGame(game: Game) {
        GameController.games.push(game)
        return game
    }

    static saveGame(game: Game) {
        const index = GameController.games.findIndex((g) => g.id === game.id)
        if (index === -1) {
            GameController.addGame(game)
        } else {
            GameController.games[index] = game
        }
        return game
    }

    static getGame(gameId: number) {
        return GameController.games.find((game) => game.id === gameId)
    }

    static getAllGames() {
        return GameController.games
    }

    static getFinishedGames(): Game[] {
        return GameController.games.filter(
            (game) => game.status === GAME_STATUS.FINISHED
        )
    }
}

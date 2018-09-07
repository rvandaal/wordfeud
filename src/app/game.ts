import { LetterTile } from './lettertile';
import { Player } from './player';
import * as _ from 'lodash';

export class Game {
    public players: Player[];
    public activePlayer: Player;
    public committedLetters: LetterTile[];

    static deserialize(json: any): Game {
        const game = new Game();
        game.players = [];
        game.committedLetters = [];
        Object.keys(json.players).forEach(p => game.players.push(Player.deserialize(json.players[p])));
        Object.keys(json.committedLetters).forEach(c => game.committedLetters.push(LetterTile.deserialize(json.committedLetters[c])));
        if (game.players[0].name === json.activePlayer.name) {
            game.activePlayer = game.players[0];
        } else {
            game.activePlayer = game.players[1];
        }
        return game;
    }

    constructor() {
        this.committedLetters = [];
    }

    getId() {
        return _.orderBy(this.players.map(p => p.name)).join();
    }

    isEqual(game: Game) {
        return this.getId() === game.getId();
    }
}

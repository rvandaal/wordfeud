import { LetterTile } from './lettertile';
import { Player } from './player';

export class Game {
    public players: Player[];
    public activePlayer: Player;
    public committedLetters: LetterTile[];

    constructor() {
        this.committedLetters = [];
    }
}

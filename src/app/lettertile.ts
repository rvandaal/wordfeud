export class LetterTile {
    row: number;
    col: number;
    letter: string;

    constructor(row: number, col: number, letter: string) {
        this.row = row;
        this.col = col;
        this.letter = letter;
    }

    get value(): number {
        if (['A', 'E', 'N', 'O'].includes(this.letter)) {
            return 1;
        }
        if (['D', 'I', 'R', 'S', 'T', 'U'].includes(this.letter)) {
            return 2;
        }
        if (['G', 'K', 'L', 'M'].includes(this.letter)) {
            return 3;
        }
        if (['B', 'F', 'H', 'J', 'P', 'V'].includes(this.letter)) {
            return 4;
        }
        if (['C', 'W', 'Z'].includes(this.letter)) {
            return 5;
        }
        if (['X', 'Y'].includes(this.letter)) {
            return 8;
        }
        if (['Q'].includes(this.letter)) {
            return 10;
        }
        return 0;
    }
}

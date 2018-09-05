import { LetterTile } from './lettertile';
import { CellType } from './gridcell';

export class Word {
    public letters: LetterTile[];
    public isNew: boolean;

    constructor(letters: LetterTile[]) {
        this.letters = letters;
        this.isNew = true;
    }

    public get score() {
        if (this.letters.length < 2) {
            return 0;
        }
        const noDW = this.letters.filter(l => l.isNew && l.cell.type === CellType.DW).length;
        const noTW = this.letters.filter(l => l.isNew && l.cell.type === CellType.TW).length;
        const wordMultiplier = (noDW > 0 ? 2 * noDW : 1) * (noTW > 0 ? 3 * noTW : 1);
        const lettersScore = this.letters.reduce((acc, cur) => acc + cur.score, 0);
        return lettersScore * wordMultiplier;
    }

    public toString() {
        return this.letters.map(l => l.letter).join('');
    }

    public get length() {
        return this.letters.length;
    }
}

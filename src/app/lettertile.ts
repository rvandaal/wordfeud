import { GridCell, CellType } from './gridcell';
export class LetterTile {
    public letter: string;
    public isNew: boolean;
    public cell: GridCell;
    public isHighlighted: boolean;

    constructor(letter: string, cell: GridCell) {
        this.letter = letter;
        this.isNew = true;
        this.cell = cell;
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

    get score() {
        return this.value * (this.isNew && this.cell.type === CellType.TL ? 3 : (this.isNew && this.cell.type === CellType.DL ? 2 : 1));
    }
}

export enum CellType {
    None = '',
    DL = 'DL',
    TL = 'TL',
    DW = 'DW',
    TW = 'TW'
}

export class GridCell {
    row: number;
    col: number;
    type: CellType;

    constructor(row: number, col: number, type: CellType) {
        this.row = row;
        this.col = col;
        this.type = type;
    }
}

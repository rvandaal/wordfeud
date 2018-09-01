import { Component, OnInit, Input, HostListener, Output, EventEmitter } from '@angular/core';
import { GridCell, CellType } from '../gridcell';
import { LetterTile } from '../lettertile';

enum KEY_CODE {
  RIGHT_ARROW = 39,
  LEFT_ARROW = 37,
  UP_ARROW = 38,
  DOWN_ARROW = 40
}

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {

  gridcells: GridCell[];
  selectedGridCell: GridCell;

  @Input()
  letters: LetterTile[];

  @Output()
  letterPlaced = new EventEmitter<LetterTile>();

  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.keyCode === KEY_CODE.RIGHT_ARROW) {
      if (this.selectedGridCell.col < 14) {
        this.selectCell(this.selectedGridCell.row, this.selectedGridCell.col + 1);
      }
    } else if (event.keyCode === KEY_CODE.LEFT_ARROW) {
      if (this.selectedGridCell.col > 0) {
        this.selectCell(this.selectedGridCell.row, this.selectedGridCell.col - 1);
      }
    } else if (event.keyCode === KEY_CODE.DOWN_ARROW) {
      if (this.selectedGridCell.row < 14) {
        this.selectCell(this.selectedGridCell.row + 1, this.selectedGridCell.col);
      }
    } else if (event.keyCode === KEY_CODE.UP_ARROW) {
      if (this.selectedGridCell.row > 0) {
        this.selectCell(this.selectedGridCell.row - 1, this.selectedGridCell.col);
      }
    }  else {
      const newLetterTile = new LetterTile(String.fromCharCode(event.keyCode), this.selectedGridCell);
      this.letterPlaced.emit(newLetterTile);
    }
  }

  constructor() {
    const celldefs_dl = [7, 16, 28, 36, 38, 66, 68, 92, 94, 100, 102, 105, 119, 122, 124, 130, 132, 156, 158, 186, 188, 196, 208, 217];
    const celldefs_tl = [0, 14, 20, 24, 48, 56, 76, 80, 84, 88, 136, 140, 144, 148, 168, 176, 200, 204, 210, 224];
    const celldefs_dw = [32, 42, 52, 64, 70, 108, 116, 154, 160, 172, 182, 192];
    const celldefs_tw = [4, 10, 60, 74, 150, 164, 214, 220];
    this.gridcells = [];
    let i = 0;
    for (let row = 0; row < 15; row++) {
      for (let col = 0; col < 15; col++) {
        let type = CellType.None;
        if (celldefs_dl.includes(i)) {
          type = CellType.DL;
        } else if (celldefs_tl.includes(i)) {
          type = CellType.TL;
        } else if (celldefs_dw.includes(i)) {
          type = CellType.DW;
        } else if (celldefs_tw.includes(i)) {
          type = CellType.TW;
        } else if (i === 112) {
          type = CellType.Middle;
        }

        this.gridcells.push(new GridCell(row, col, type));
        i++;
      }
    }
  }

  ngOnInit() {
  }

  public onClick(cell: GridCell) {
    this.selectedGridCell = cell;
  }

  private getCell(row: number, col: number) {
    return this.gridcells.filter(c => c.row === row && c.col === col)[0];
  }

  private selectCell(row: number, col: number) {
    this.selectedGridCell = this.getCell(row, col);
  }
}

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

  selectedColIndex: number;
  selectedRowIndex: number;

  gridcells: GridCell[];
  committedLetters: LetterTile[];
  placedLetters: LetterTile[];

  get allLetters() {
    return [...this.committedLetters, ...this.placedLetters];
  }

  @Output()
  letterPlaced = new EventEmitter<LetterTile>();

  @Output()
  placedLettersCleared = new EventEmitter();

  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.keyCode === KEY_CODE.RIGHT_ARROW) {
      if (this.selectedColIndex < 14) {
        this.selectedColIndex++;
      }
    } else if (event.keyCode === KEY_CODE.LEFT_ARROW) {
      if (this.selectedColIndex > 0) {
        this.selectedColIndex--;
      }
    } else if (event.keyCode === KEY_CODE.DOWN_ARROW) {
      if (this.selectedRowIndex < 14) {
        this.selectedRowIndex++;
      }
    } else if (event.keyCode === KEY_CODE.UP_ARROW) {
      if (this.selectedRowIndex > 0) {
        this.selectedRowIndex--;
      }
    }  else {
      const newLetterTile = new LetterTile(this.selectedRowIndex + 1, this.selectedColIndex + 1, String.fromCharCode(event.keyCode));
      this.placedLetters.push(newLetterTile);
      this.letterPlaced.emit(newLetterTile);
    }
  }

  constructor() {
    const celldefs_dl = [7, 16, 28, 36, 38, 66, 68, 92, 94, 100, 102, 105, 119, 122, 124, 130, 132, 156, 158, 186, 188, 196, 208, 217];
    const celldefs_tl = [0, 14, 20, 24, 48, 56, 76, 80, 84, 88, 136, 140, 144, 148, 168, 176, 200, 204, 210, 224];
    const celldefs_dw = [32, 42, 52, 64, 70, 108, 116, 154, 160, 172, 182, 192];
    const celldefs_tw = [4, 10, 60, 74, 150, 164, 214, 220];
    this.gridcells = [];
    this.committedLetters = [];
    this.placedLetters = [];
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

  public commitPlacedLetters() {
    this.committedLetters = this.allLetters;
    this.allLetters.forEach(t => t.new = false);
    this.clearPlacedLetters();
  }

  public onClick(cell: GridCell) {
    this.selectedColIndex = cell.col;
    this.selectedRowIndex = cell.row;
  }

  isSelected(cell: GridCell) {
    return cell.col === this.selectedColIndex && cell.row === this.selectedRowIndex;
  }

  private clearPlacedLetters() {
    this.placedLetters = [];
    this.placedLettersCleared.emit();
  }

}

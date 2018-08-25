import { Component } from '@angular/core';

enum CellType {
  None = '',
  DL = 'DL',
  TL = 'TL',
  DW = 'DW',
  TW = 'TW'
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  letters: any[];
  gridcells: any[];

  tmp: string = 'hello';

  selectedColIndex: number;
  selectedRowIndex: number;

  constructor() {
    const celldefs_dl = [7, 16, 28, 36, 38, 66, 68, 92, 94, 100, 102, 105, 119, 122, 124, 130, 132, 156, 158, 186, 188, 196, 208, 217];
    const celldefs_tl = [ 0, 14, 20, 24, 48, 56, 76, 80, 84, 88, 136, 140, 144, 148, 168, 176, 200, 204, 210, 224 ];
    const celldefs_dw = [ 32, 42, 52, 64, 70, 108, 116, 154, 160, 172, 182, 192 ];
    const celldefs_tw = [ 4, 10, 60, 74, 150, 164, 214, 220];
    this.gridcells = [];
    this.letters = [];
    let i = 0;
    for (let row = 0; row < 15; row++) {
      for (let col = 0; col < 15; col++) {
        let type = CellType.None;
        if (celldefs_dl.includes(i)) {
          type = CellType.DL;
        } else if (celldefs_tl.includes(i)) {
          type = CellType.TL;
        }  else if (celldefs_dw.includes(i)) {
          type = CellType.DW;
        }  else if (celldefs_tw.includes(i)) {
          type = CellType.TW;
        }

        this.gridcells.push({ row: row, col: col, type: type });

        if(col === 5 && row > 6 && row < 12) {
          this.letters.push({ row: row, col: col, letter: 'A'});
        }
        i++;
      }
    }
  }

  public onClick(cell) {
    this.selectedColIndex = cell.col;
    this.selectedRowIndex = cell.row;
  }

  isSelected(cell: any) {
    return cell.col === this.selectedColIndex && cell.row === this.selectedRowIndex;
  }
}

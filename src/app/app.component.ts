import { BoardComponent } from './board/board.component';
import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Player } from './player';
import { LetterTile } from './lettertile';
import * as _ from 'lodash';

enum State {
  inputPlayers,
  player1,
  player2
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  @ViewChild(BoardComponent) board: BoardComponent;

  public State = State;
  public state: State;
  public form: FormGroup;
  public players: Player[];
  public activePlayer: Player;
  public committedLetters: LetterTile[];
  public placedLetters: LetterTile[];
  public errors: string[];

  get allLetters() {
    return [...this.committedLetters, ...this.placedLetters];
  }

  constructor() {
    this.state = State.inputPlayers;
    this.form = new FormGroup({
      player1Name: new FormControl('Rob'),
      player2Name: new FormControl(),
      startPlayer: new FormControl('1')
    });
    this.committedLetters = [];
    this.placedLetters = [];
  }

  startGame() {
    this.players = [new Player(this.form.get('player1Name').value), new Player(this.form.get('player2Name').value)];
    if (this.form.get('startPlayer').value === '1') {
      this.state = State.player1;
      this.activePlayer = this.players[0];
    } else {
      this.state = State.player2;
      this.activePlayer = this.players[1];
    }
    this.placedLetters = [];
  }

  onLetterPlaced(letterTile: LetterTile) {
    this.placedLetters.push(letterTile);
  }

  speel() {
    const result = this.validatePlacedLetters();
    if (result.length) {
      this.errors = result;
    } else {
      this.commitPlacedLetters();
      this.errors = [];
    }
  }

  private validatePlacedLetters(): string[] {
    const result = [];
    const resultOneDimension = this.validateOneDimension();
    const resultConnectedToExisting = this.validateConnectedToExisting();
    if (resultOneDimension) {
      result.push(resultOneDimension);
    }
    if (resultConnectedToExisting) {
      result.push(resultConnectedToExisting);
    }
    return result;
  }

  private validateOneDimension(): string {
    const firstPlacedLetter = this.placedLetters[0];
    const onOneLine = _.every(this.placedLetters, l => l.cell.col === firstPlacedLetter.cell.col) ||
            _.every(this.placedLetters, l => l.cell.row === firstPlacedLetter.cell.row);
    if (onOneLine !== true) {
      return 'Alle geplaatste letters moeten op 1 lijn liggen!';
    }
    return null;
  }

  private validateConnectedToExisting(): string {
    const connectedLetters = [...this.committedLetters];
    const lettersToCheck = [...this.placedLetters];
    const all = [...this.allLetters];
    let error: boolean;
    let i = 0;

    if(!connectedLetters.length) {
      return null;
    }

    while (lettersToCheck.length && i < 7 && !error) {
      let someLetterConnected = false;
      lettersToCheck.forEach(ltc => {
        if (_.some(connectedLetters, cl => this.isLetterNextToOtherLetter(all, ltc, cl))) {
          connectedLetters.push(ltc);
          const j = lettersToCheck.indexOf(ltc);
          lettersToCheck.splice(j, 1);
          someLetterConnected = true;
        }
      });
      // if(someLetterConnected !== true) {
      //   error = true;
      // } else {
      //   continue;
      // }
      i++;
    }
    return lettersToCheck.length > 0 || error ? 'Alle letters moeten aansluiten op de bestaande letters!' : null;
  }

  private isLetterNextToOtherLetter(letters: LetterTile[], letter1: LetterTile, letter2: LetterTile) {
    return this.getLetter(letters, letter1.cell.row + 1, letter1.cell.col) === letter2 ||
      this.getLetter(letters, letter1.cell.row - 1, letter1.cell.col) === letter2 ||
      this.getLetter(letters, letter1.cell.row, letter1.cell.col + 1) === letter2 ||
      this.getLetter(letters, letter1.cell.row, letter1.cell.col - 1) === letter2;
  }

  private getLetter(letters: LetterTile[], row: number, col: number): LetterTile {
    const tmp = letters.filter(l => l.cell.row === row && l.cell.col === col);
    if (tmp.length) {
      return tmp[0];
    }
    return null;
  }

  private commitPlacedLetters() {
    this.committedLetters = this.allLetters;
    this.allLetters.forEach(t => t.new = false);
    this.placedLetters = [];
  }
}

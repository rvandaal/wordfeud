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
  public currentScore: number;

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
    this.highlightLettersForScore();
  }

  play() {
    const result = this.validatePlacedLetters();
    if (result.length) {
      this.errors = result;
    } else {
      this.commitPlacedLetters();
      this.errors = [];
    }
  }

  clearPlacedLetters() {
    this.placedLetters = [];
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

    if (!connectedLetters.length) {
      while (lettersToCheck.length && i < 7 && !error) {
        let someLetterConnected = false;
        lettersToCheck.forEach(ltc => {
          if (
            !connectedLetters.length && ltc.cell.row === 7 && ltc.cell.col === 7 ||
            _.some(connectedLetters, cl => connectedLetters.length && this.isLetterNextToOtherLetter(all, ltc, cl))
          ) {
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
      return lettersToCheck.length > 0 || error ? 'Het eerste woord moet door het midden gaan!' : null;
    } else {
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
    this.allLetters.forEach(t => { t.new = false; t.isMarkedForScore = false; });
    this.placedLetters = [];
    this.activePlayer.score += this.currentScore;
  }

  private highlightLettersForScore() {
    const lettersForScore = [...this.placedLetters];
    this.placedLetters.forEach(l => this.highlightLettersForScoreForPlacedLetter(l, lettersForScore));
    lettersForScore.forEach(l => l.isMarkedForScore = true);
    this.currentScore = lettersForScore.reduce((acc, cur) => acc + cur.value, 0);
  }

  private highlightLettersForScoreForPlacedLetter(letter: LetterTile, lettersForScore: LetterTile[]) {
    this.highlightLettersForScoreForPlacedLetterInOneDirection(letter, lettersForScore, -1, 0);
    this.highlightLettersForScoreForPlacedLetterInOneDirection(letter, lettersForScore, 1, 0);
    this.highlightLettersForScoreForPlacedLetterInOneDirection(letter, lettersForScore, 0, -1);
    this.highlightLettersForScoreForPlacedLetterInOneDirection(letter, lettersForScore, 0, 1);
  }

  private highlightLettersForScoreForPlacedLetterInOneDirection(
    letter: LetterTile,
    lettersForScore: LetterTile[],
    colDelta: number,
    rowDelta: number
  ) {
    let c = letter.cell.col + colDelta;
    let r = letter.cell.row + rowDelta;
    let currentLetter = this.getLetter(this.allLetters, r, c);
    while (currentLetter != null) {
      if (!lettersForScore.includes(currentLetter)) {
        lettersForScore.push(currentLetter);
      }
      c += colDelta;
      r += rowDelta;
      currentLetter = this.getLetter(this.allLetters, r, c);
    }
  }

}

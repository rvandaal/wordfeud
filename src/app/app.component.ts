import { BoardComponent } from './board/board.component';
import { Component, ViewChild, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { FormGroup, FormControl } from '@angular/forms';
import { Player } from './player';
import { LetterTile } from './lettertile';
import * as _ from 'lodash';
import { Word } from './word';

// https://hackernoon.com/import-json-into-typescript-8d465beded79
// import * as worddata from './words.json'; // dit kunnen we doen als de hele woordenlijst compleet is.
// We kunnen namelijk niet terugschrijven naar deze json.

enum State {
  inputPlayers,
  player1,
  player2
}

class WordScore {
  constructor(public word: string, public score: number) {
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {

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
  public newWords: Word[] = [];

  private allWords: string[] = [];

  get allLetters() {
    return [...this.committedLetters, ...this.placedLetters];
  }

  get newWordStrings(): WordScore[] {
    return this.newWords.map(w => new WordScore(w.toString(), w.score));
  }

  constructor(
    // https://www.ryadel.com/en/angular-5-access-window-document-localstorage-browser-types-angular-universal/
    @Inject(PLATFORM_ID) private platformId: any,
    @Inject('LOCALSTORAGE') private localStorage: any
  ) {
    this.state = State.inputPlayers;
    this.form = new FormGroup({
      player1Name: new FormControl('Rob'),
      player2Name: new FormControl(),
      startPlayer: new FormControl('1')
    });
    this.committedLetters = [];
    this.placedLetters = [];
    this.loadAllWords();
  }

  ngOnDestroy() {
    this.saveAllWords();
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
    const existingLetter = this.getLetter(this.placedLetters, letterTile.cell.row, letterTile.cell.col);
    const sameLetter = existingLetter ? existingLetter.letter === letterTile.letter : false;
    if (sameLetter) {
      letterTile.isJoker = !existingLetter.isJoker;
    }
    if (existingLetter) {
      const index = this.placedLetters.indexOf(existingLetter);
      this.placedLetters.splice(index, 1);
    }
    this.placedLetters.push(letterTile);
    this.determineNewWords();
  }

  play() {
    const result = this.validatePlacedLetters();
    if (result.length) {
      this.errors = result;
    } else {
      this.commitPlacedLetters();
      this.errors = [];
      this.nextPlayer();
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
    this.allWords = _.orderBy([...this.allWords, ...this.newWordStrings.map(n => n.word)]);
    this.saveAllWords();
    this.committedLetters = this.allLetters;
    this.allLetters.forEach(t => { t.isNew = false; t.isHighlighted = false; });
    this.placedLetters = [];
    this.newWords = [];
    this.activePlayer.score += this.currentScore;
  }

  private determineNewWords() {
    this.newWords = [];
    this.placedLetters.forEach(l => this.determineNewWordsWithPlacedLetter(l, this.newWords));
    this.currentScore = this.newWords.reduce((acc, cur) => acc + cur.score, 0);
    this.newWords.forEach(w => w.highlight());
    this.log('new words: ', this.newWords);
  }

  private determineNewWordsWithPlacedLetter(letter: LetterTile, newWords: Word[]) {
    this.log('placed letter: ', letter.letter);
    if (!_.some(newWords, w => w.isHorizontal() && w.containsLetter(letter))) {
      this.log('search left');
      const leftWordpart = this.highlightLettersForScoreForPlacedLetterInOneDirection(letter, -1, 0);
      this.log('search right');
      const rightWordpart = this.highlightLettersForScoreForPlacedLetterInOneDirection(letter, 1, 0);
      const horizontalWord: Word = new Word([...leftWordpart, letter, ...rightWordpart]);
      if (horizontalWord.length > 1) {
        newWords.push(horizontalWord);
      }
    }
    if (!_.some(newWords, w => !w.isHorizontal() && w.containsLetter(letter))) {
      this.log('search top');
      const topWordpart = this.highlightLettersForScoreForPlacedLetterInOneDirection(letter, 0, -1);
      this.log('search bottom');
      const bottomWordpart = this.highlightLettersForScoreForPlacedLetterInOneDirection(letter, 0, 1);
      const verticalWord: Word = new Word([...topWordpart, letter, ...bottomWordpart]);
      if (verticalWord.length > 1) {
        newWords.push(verticalWord);
      }
    }
  }

  private highlightLettersForScoreForPlacedLetterInOneDirection(
    letter: LetterTile,
    colDelta: number,
    rowDelta: number
  ): LetterTile[] {
    let wordpart: LetterTile[] = [];
    let c = letter.cell.col + colDelta;
    let r = letter.cell.row + rowDelta;
    this.log('r: ', r, ', c: ', c);
    let currentLetter = this.getLetter(this.allLetters, r, c);
    while (currentLetter != null) {
      if (colDelta === 1 || rowDelta === 1) {
        wordpart.push(currentLetter);
      } else {
        wordpart = [currentLetter, ...wordpart];
      }
      c += colDelta;
      r += rowDelta;
      this.log('r: ', r, ', c: ', c);
      currentLetter = this.getLetter(this.allLetters, r, c);
    }
    return wordpart;
  }

  private nextPlayer() {
    this.activePlayer = this.activePlayer === this.players[0] ? this.players[1] : this.players[0];
  }

  private log(text: string, ...optionalParams: any[]) {
    // console.log(text, ...optionalParams);
  }

  private saveAllWords() {
    // this.localStorage.setItem('wordfeud_words', JSON.stringify(this.allWords));
    this.localStorage.setItem('wordfeud_words', this.allWords);
  }

  private loadAllWords() {
    // this.allWords = JSON.parse(this.localStorage.getItem('wordfeud_words'));
    this.allWords = this.localStorage.getItem('wordfeud_words');
    if (this.allWords == null) {
      this.allWords = [];
    }
  }
}

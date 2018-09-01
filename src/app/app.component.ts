import { BoardComponent } from './board/board.component';
import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Player } from './player';
import { LetterTile } from './lettertile';

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
    // validateletters
    this.commitPlacedLetters();
  }

  private commitPlacedLetters() {
    this.committedLetters = this.allLetters;
    this.allLetters.forEach(t => t.new = false);
    this.placedLetters = [];
  }
}

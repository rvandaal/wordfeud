import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

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
  public State = State;
  public state: State;
  public form: FormGroup;

  constructor() {
    this.state = State.inputPlayers;
    this.form = new FormGroup({
      player1Name: new FormControl('Rob'),
      player2Name: new FormControl(),
      startPlayer: new FormControl('1')
    });
  }

  startGame() {
    if (this.form.get('startPlayer').value === '1') {
      this.state = State.player1;
    } else {
      this.state = State.player2;
    }
  }
}

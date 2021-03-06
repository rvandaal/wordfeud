import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { BoardComponent } from './board/board.component';
import { WordService } from './word.service';

@NgModule({
  imports: [BrowserModule, FormsModule, ReactiveFormsModule],
  declarations: [AppComponent, BoardComponent],
  providers: [WordService, { provide: 'LOCALSTORAGE', useFactory: getLocalStorage }],
  bootstrap: [AppComponent]
})
export class AppModule { }

export function getLocalStorage() {
  return (typeof window !== 'undefined') ? window.localStorage : null;
}
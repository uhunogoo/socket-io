import EventEmitter from './EventEmitter.js';

export default class RoundManager extends EventEmitter {
  constructor( game ) {
    super();
    this.game = game;
    this.rounds = new Map();
  }

  add( index, round ) {
    const existingRound = this.rounds.get( index );
    if ( existingRound ) return;

    this.rounds.set( index, round );
  }

  get( index ) {
    return this.rounds.get( index );
  }

  getCurrentRound() {
    return this.rounds.get( this.game.currentRound );
  }

  switchToNextRound() {
    // Get current round data
    const gameData = this.game.getGameData();

    // Game is over
    if ( ( gameData.currentRound + 1 ) >= gameData.questionsCount ) {
      this.trigger( 'game-over' );
      return;
    }

    // Move to next round
    this.game.currentRound++;
    // this.emit( 'round-changed', this.game.currentRound );
  }

  destroy() {
    this.rounds.clear();
  }
}

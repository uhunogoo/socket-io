import { Room } from '../models/Room.js';
import { PlayerService } from './playerService.js';
import { QuestionManager } from './QuestionManager';
import { RoundManager } from './RoundManager.js';
import { ScoreManager } from './ScoreManager.js';

export class GameInstance {
  constructor( db, roomData ) {
    this.db = db;
    this.room = new Room( roomData);

    // Core game state
    this.currentRound = 0;
    
    // Game services
    this.playerService = new PlayerService();
    this.questionManager = new QuestionManager( this );
    this.roundManager = new RoundManager( this );
    this.scoreManager = new ScoreManager( this );
    
    // Game management
    this.timers = new Map();
    this.answers = new Map();

    // Game state
    this.initialized = false;
  }

  initGame( questions ) {
    if ( this.initialized ) {
      throw new Error(`Game for ${ this.room.pin } already initialized`);
    }
    
    this.questionManager.addQuestions( questions );
    this.initialized = true;
  }

  // Core Game Actions (high-level, game-logic oriented)
  startRound() {
    this.roundManager.startRound();
  }
  endGame() {}

  // Player Management (delegated, but only what’s *directly* needed for game flow)
  addPlayer( playerData ) {
    return this.playerService.addPlayer( playerData );
  }

  removePlayer( playerId ) {
    this.playerService.removePlayer( playerId );
  }

  getPlayer( playerId ) {
    return this.playerService.getPlayer( playerId );
  }

  // Round Management
  submitAnswer(playerId, answerData) {
    this.questionManager.submitAnswer( playerId, answerData );
  }

  getCurrentRound() {
    return this.currentRound;
  }

  nextRound() {
    this.currentRound++;
  }

  cleanup() {
    for ( const timer of this.timers.values() ) {
      clearTimeout( timer.ref );
    }
    this.timers.clear();
    this.answers.clear();
    this.room.setStatus( 'finished' );
  }
}

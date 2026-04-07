import { Room } from '../models/Room.js';
import { PlayerService } from './PlayerService.js';
import { QuestionManager } from './QuestionManager.js';
import { RoundManager } from './RoundManager.js';
import { AnswerManager } from './AnswerManager.js';

export class GameInstance {
  constructor( db, roomData ) {
    this.db = db;
    this.room = new Room( roomData);

    // Core game state
    this.status = this.room.getStatus() || 'lobby';

    // Game management
    this.currentRound = 0;

    // Game state
    this.hostConnected = false;
    this.initialized = false;

    // Game services
    this.playerService = new PlayerService();
    this.questionManager = new QuestionManager( this );
    this.roundManager = new RoundManager( this );
    this.answerManager = new AnswerManager( this );
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
    const now = Date.now();

    return {
      round: this.currentRound,
      status: 'playing',
      question: this.questionManager.getCurrentQuestion(),
      roundDuration: this.room.getRoundDuration(),
      roundStartedAt: now,
    }
  }

  endRound() {
    this.roundManager.endRound();
  }

  // Player Management (delegated, but only what’s *directly* needed for game flow)
  addPlayer( playerData ) {
    return this.playerService.addPlayer( playerData );
  }

  removePlayer( playerToken ) {
    this.playerService.removePlayer( playerToken );
  }

  getPlayer( playerToken ) {
    return this.playerService.getPlayer( playerToken );
  }

  // Round Management
  submitAnswer(playerToken, answerData) {
    this.roundManager.submitAnswer( playerToken, answerData );
  }

  getCurrentRound() {
    return this.roundManager.currentRound;
  }

  cleanup() {
    // Clear active timer
    if ( this.timer ) {
      clearTimeout( this.timer );
      this.timer = null;
    }

    this.answers.clear();
    this.room.setStatus( 'finished' );
  }
}

import AnswerManager from './AnswerManager.js';
import PlayersManager from './PlayersManager.js';
import { copyObject } from '../../lib/helpers.js';

export default class Game {
  constructor() {
    // Game state
    this.status = 'lobby'; // will take from the room -> lobby | playing | between_rounds | finished
    this.currentRound = 0;
    this.timers = new Map();
    
    // Game settings
    this.timeToAnswer = 30 * 1000;
    this.maxScore = 1000;

    // Game data
    this.room = null;
    this.answers = new AnswerManager( this );
    this.players = new PlayersManager();
    this.questions = [];
    this.rounds = new Map();
  }

  getGameData() {
    return {
      status: this.status,
      currentRound: this.currentRound,
      questions: this.questions[ this.currentRound ] || [],
      questionsCount: this.questions.length,
      players: this.players.getAll(),
      answers: this.answers.getCurrentRoundAnswers(),
      roundDuration: this.timeToAnswer,
    };
  }

  startRound() {
    this.status = 'playing';

    // Get game data and setup round data
    const gameData = this.getGameData();
    const roundData = copyObject( {
      ...gameData,
      roundStartedAt: Date.now()
    } );

    // Add round data
    this.rounds.set( this.currentRound, roundData );
    
    return roundData;  // return data for notification
  }

  switchToNextRound() {
    this.currentRound++;
  }

  getCurrentRound() {
    return this.rounds.get( this.currentRound );
  }
}

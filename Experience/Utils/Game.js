import PlayersManager from './PlayersManager.js';
import QuestionManager from './QuestionManager.js';

export default class Game {
  constructor() {
    // Game state
    this.status = 'lobby'; // will take from the room -> lobby, playing, finished
    this.currentRound = 0;
    this.timers = new Map();
    
    // Game data
    this.room = null;
    this.players = new PlayersManager();
    this.questions = new QuestionManager();
    this.rounds = new Map();
    this.answers = new Map();
  }

  setRoundData() {
    this.rounds.set( this.currentRound, {
      status: this.status,
      round: this.currentRound,
      questions: this.questions.get( this.currentRound ) || [],
      questionsCount: this.questions.getLength(),
      players: this.players.getAll(),
      answers: this.answers,
      roundDuration: this.room.timeToAnswer,
      roundStartedAt: Date.now()
    });
  }

  getRoundData() {
    return this.rounds.get( this.currentRound );
  }
}

import RoundManager from './RoundManager.js';
import AnswerManager from './AnswerManager.js';
import PlayersManager from './PlayersManager.js';
import QuestionManager from './QuestionManager.js';

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
    this.questions = new QuestionManager();
    this.rounds = new RoundManager( this );
  }

  getGameData() {
    return {
      status: this.status,
      currentRound: this.currentRound,
      questions: this.questions.get( this.currentRound ) || [],
      questionsCount: this.questions.getLength(),
      players: this.players.getAll(),
      answers: this.answers.getCurrentRoundAnswers(),
      roundDuration: this.timeToAnswer,
      // roundStartedAt: Date.now()
    };
  }

  // getRoundData() {
  //   return this.rounds.get( this.currentRound );
  // }
}

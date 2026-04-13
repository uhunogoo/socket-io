import PlayersManager from './PlayersManager.js';
import QuestionManager from './QuestionManager.js';

export default class Game {
  constructor() {
    // Game state
    this.state = 'lobby'; // will take from the room -> lobby, playing, finished
    this.currentRound = 0;
    this.timers = new Map();
    
    // Game data
    this.room = null;
    this.players = new PlayersManager();
    this.questions = new QuestionManager();
    this.rounds = [];
    this.answers = new Map();
  }
}

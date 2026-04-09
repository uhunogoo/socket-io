export default class Game {
  constructor() {
    // Game state
    this.state = 'lobby'; // will take from the room -> lobby, playing, finished
    this.currentRound = 0;
    
    // Game data
    this.room = null;
    this.players = new Array();
    this.questions = new Array();
    this.rounds = new Array();
    this.answers = new Array();
  }
}

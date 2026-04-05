export class RoundManager {
  constructor( gameInstance ) {
    this.gameInstance = gameInstance;
    this.isRoundActive = false;
  }
  // this.gameInstance.getCurrentRound(); -> when needed to get current round
  startRound() {
    this.isRoundActive = true;
  }
  
  endRound() {
    this.isRoundActive = false;
  }
}

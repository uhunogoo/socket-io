export class GameService {
  constructor(gameState, db) {
    this.gameState = gameState;
    this.db = db;
    this.roundTimers = new Map(); // roomId → timer handle
  }

  async startRound(roomId, roundIndex, io) {
  }

  async endRound(roomId, io) {
  }
  
  cancelRound(roomId) {
  }
}

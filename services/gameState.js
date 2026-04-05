import { GameInstance } from './GameInstance.js';

export class GameState {
  constructor( db ) {
    this.games = new Map(); // roomId -> GameInstance
    this.db = db;
  }

  async createGame( roomData ) {
    const game = new GameInstance( roomData.roomId, this.db );
    this.games.set( roomData.roomId, game );
    return game;
  }

  getGame( roomToken ) {
    return this.games.get( roomToken );
  }

  clearGame( roomToken ) {
    const game = this.games.get( roomToken );
    if ( game ) {
      game.cleanup();
      this.games.delete( roomToken );
    }
  }
}

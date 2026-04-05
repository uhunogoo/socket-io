import { GameInstance } from "./GameInstance.js";

export class GameRoomRegistry {
  constructor( db ) {
    this.db = db;
    this.games = new Map();
  }
  
  createGame( roomToken, roomData, questions ) {
     if ( this.games.has( roomToken ) ) {
      throw new Error(`Game "${ roomToken }" already exists`);
    }
    
    const game = new GameInstance( this.db, roomData );
    game.initGame( questions );
    this.games.set( roomToken, game );
    
    return game;
  }
  
  getGame(roomToken) {
    return this.games.get(roomToken);
  }
  
  removeGame(roomToken) {
    this.games.delete(roomToken);
  }
  
  getAllGames() {
    return this.games;
  }
}

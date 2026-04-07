import { GameInstance } from "./GameInstance.js";

export class GameRoomRegistry {
  constructor( db ) {
    this.db = db;
    this.games = new Map();
  }
  
  createGame( roomId, roomData, questions, { force = false } = {} ) {
    const existingGame = this.games.get( roomId );

    if ( existingGame && !force ) {
      if ( roomData.maxPlayers !== existingGame.room.maxPlayers ) {
        existingGame.room.maxPlayers = roomData.maxPlayers;
      }

      return existingGame;
    }
    
    const game = new GameInstance( this.db, roomData );
    game.initGame( questions );
    this.games.set( roomId, game );
    
    return game;
  }
  
  getGame( roomId ) {
    return this.games.get( roomId );
  }
  
  removeGame( roomId ) {
    const game = this.games.get( roomId );
    if ( game ) game.cleanup();
    this.games.delete( roomId );
  }
  
  getAllGames() {
    return this.games;
  }
}

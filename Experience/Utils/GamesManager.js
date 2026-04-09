import PlayersManager from './PlayersManager.js';

export default class GamesManager {
  constructor(db) {
    this.db = db;
    this.games = new Map();
    this.playersManager = new PlayersManager();
    // this.questsManager = new QuestsManager();
  }

  create( roomId, playerToken, questions ) {
    const game = this.db.getRoom( roomId, playerToken );
    this.games.set( roomId, game );
  }

  get( gameId ) {
    return this.games.get( gameId );
  }
  
  playerJoin( gameId, player ) {
    this.playersManager.add( player );
  }

  update() {}

  destroy( gameId ) {
    this.games.delete( gameId );
  }
}
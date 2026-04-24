export default class PlayersManager {
  constructor() {
    this.players = new Map();
  }

  get( playerToken ) {
    return this.players.get( playerToken );
  }

  getAll() {
    return Array.from( this.players.values() );
  }

  upsert( playerToken, playerData ) {
    const player = this.players.get( playerToken );
    
    // If player exists, update it
    if ( player ) {
      const updatedPlayer = { 
        ...player, 
        ...playerData 
      };

      this.players.set( playerToken, updatedPlayer );
      return updatedPlayer;
    }

    // If player doesn't exist, create it
    this.players.set( playerToken, playerData );
    return playerData;
  }

  destroy( playerToken ) {
    this.players.delete( playerToken );
    return this.getAll();
  }
}
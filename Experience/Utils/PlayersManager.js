export default class PlayersManager {
  constructor() {
    this.players = new Map();
  }

  add( player ) {
    const { playerToken } = player;
    if ( this.players.has( playerToken ) ) {
      throw new Error(`Player "${playerToken}" already exists in this service.`);
    }

    this.players.set( playerToken, player );
    return player;
  }

  get( playerToken ) {
    return this.players.get( playerToken );
  }

  getAll() {
    return Array.from( this.players.values() );
  }

  update( playerToken, updateData ) {
    const player = this.players.get( playerToken );
    if (!player) return false;
    
    const updatedPlayer = { ...player, ...updateData };
    this.players.set(playerToken, updatedPlayer);
    
    return updatedPlayer;
  }

  destroy( playerToken ) {
    this.players.delete( playerToken );
    return this;
  }
}
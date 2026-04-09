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

  get( playerId ) {
    return this.players.get( playerId );
  }

  update( playerId, updateData ) {
    const player = this.players.get( playerId );
    if (!player) return false;
    
    const updatedPlayer = { ...player, ...updateData };
    this.players.set(playerId, updatedPlayer);
    
    return updatedPlayer;
  }

  destroy( playerId ) {
    this.players.delete( playerId );
  }
}
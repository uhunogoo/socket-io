import { Player } from "../models/Player.js";

export class PlayerService {
  constructor() {
    this.players = new Map(); // playerId -> player
  }

  addPlayer( playerData ) {
    const { id } = playerData;
    if ( this.players.has( id ) ) {
      throw new Error(`Player "${id}" already exists in this service.`);
    }

    const newPlayer = new Player( playerData );
    this.players.set( id, newPlayer );
    return newPlayer;
  }

  updatePlayer( playerId, updatePlayerData ) {
    const existingPlayer = this.players.get( playerId );
    if (!existingPlayer) {
      throw new Error(`Player "${ playerId }" not found.`);
    }

    const updatedPlayer = new Player({ ...existingPlayer, ...updatePlayerData });
    this.players.set( playerId, updatedPlayer );

    return updatedPlayer;
  }
  
  getPlayer( playerId ) {
    return this.players.get( playerId );
  }
  
  removePlayer( playerId ) {
    this.players.delete( playerId );
  }
  
  getAllPlayers() {
    return Array.from( this.players.values() );
  }
  
  getPlayersCount() {
    return this.players.size;
  }
}

import { Player } from "../models/Player.js";

export class PlayerService {
  constructor() {
    this.players = new Map(); // playerId -> player
  }

  addPlayer( playerData ) {
    const { playerToken } = playerData;
    if ( this.players.has( playerToken ) ) {
      throw new Error(`Player "${playerToken}" already exists in this service.`);
    }

    const newPlayer = new Player( playerData );
    this.players.set( newPlayer.playerToken, newPlayer );
    return newPlayer;
  }

  updatePlayer( playerId, updatePlayerData ) {
    const existingPlayer = this.players.get( playerId );
    if (!existingPlayer) {
      console.warn(`Player "${ playerId }" not found.`);
      return false;
    }

    const updatedPlayer = new Player({ ...existingPlayer, ...updatePlayerData });
    this.players.set( playerId, updatedPlayer );

    return updatedPlayer;
  }
  
  getPlayer( playerToken ) {
    return this.players.get( playerToken );
  }
  
  removePlayer( playerToken ) {
    const player = this.players.get( playerToken );
    if (!player) return false;

    this.players.delete( playerToken );
    return true;
  }
  
  getAllPlayers() {
    return Array.from( this.players.values() );
  }
  
  getPlayersCount() {
    return this.players.size;
  }
}

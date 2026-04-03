import { Players } from '../models/Players.js';

export class PlayerService {
  constructor() {
    this.players = new Map();
  }

  createPlayer(playerData) {
    const player = new Players( playerData );

    this.players.set( player.playerToken, player );
    return player;
  }

  removeByToken( playerToken ) {
    const player = this.players.get(playerToken);
    if (player) {
      this.players.delete(playerToken);
      return true;
    }
    return false;
  }

  getPlayer(playerToken) {
    return this.players.get(playerToken);
  }
}

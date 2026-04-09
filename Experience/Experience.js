import GamesManager from './Utils/GamesManager.js';
import SocketManager from './Utils/SocketsManager.js';

/**
 * 1. Classes and utilities on one layer
 * 2. Data is multi layer if needed  
 */

export default class Experience {
  constructor( db, io ) {
    // Defaults
    this.db = db;
    this.io = io;

    // Managers
    this.games = new GamesManager();
    this.players = new PlayersManager();
    this.sockets = new SocketManager( this.io );

    // Events
    this.sockets.on('host-connect', (data) => {
      console.log('Host connected', data);
    });
  }

  init() {
    this.sockets.init();
  }
  
  startRound() {}
  endRound() {}
  update() {}
  destroy() {}
}
// Core
import Games from './Utils/Game.js';

// Managers
import SocketManager from './Utils/SocketsManager.js';

// Handlers
import HandleHost from './Handlers/HandleHost.js';
import HandlePlayers from './Handlers/HandlePlayers.js';
import HandleDisconnect from './Handlers/HandleDisconnect.js';
import HandleRound from './Handlers/HandleRound.js';

export default class Experience {
  constructor( db, io ) {
    // Defaults
    this.db = db;
    this.io = io;

    // Managers
    this.games = new Map();
    this.sockets = new SocketManager( this.io );

    // Handlers
    this.hostHandler = new HandleHost( this );
    this.playerHandler = new HandlePlayers( this );
    this.disconnectHandler = new HandleDisconnect( this );
    this.roundsHandler = new HandleRound( this );

    // Events
    this.sockets.on('host-connect', ( delegatedData ) => {
      const { socket, data } = delegatedData;
      this.hostHandler.hostConnect( socket, data );
    });
    
    this.sockets.on('player-connect', ( delegatedData ) => {
      const { socket, data } = delegatedData;
      this.playerHandler.playerConnect( socket, data );
    });
    
    this.sockets.on('disconnect', ( delegatedData ) => {
      const { socket } = delegatedData;
      this.disconnectHandler.disconnect( socket );
    });
  }

  static async create( db, io ) {
    const experience = new Experience( db, io );
    await experience.init();
    return experience;
  }

  async init() {
    const existingGames = this.games.size;
    if ( existingGames > 0 ) {
      console.log('Games already initialized', existingGames);
      return;
    }
    
    const { rooms, players, answers } = await this.db.getAllInitialData();

    for ( const room of rooms ) {
      const roomPlayers = players.filter( (player) => player.roomId === room.id );
      const roomAnswers = answers.filter( (answer) => answer.roomId === room.id );
      
      const game = this.buildGame( room, roomPlayers, roomAnswers );

      this.games.set( room.id, game );
    }
    
    // Initialize sockets after games are set
    this.sockets.init();

    return this;
  }
  
  buildGame( room, roomPlayers, roomAnswers ) {
    const game = new Games();
    game.room = room;
    roomPlayers.forEach(
      (player) => game.players.add( player )
    );
    game.answers = new Map( roomAnswers.map((answer) => [answer.id, answer]) );
    
    return game;
  }

  startRound() {}
  endRound() {}
  update() {}
  destroy() {}
}
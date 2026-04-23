// Core
import Games from './Utils/Game.js';

// Managers
import SocketManager from './Utils/SocketsManager.js';
import ClientNotifier from './Utils/ClientNotifier.js';

// Handlers
import HandleHost from './Handlers/HandleHost.js';
import HandlePlayers from './Handlers/HandlePlayers.js';
import HandleDisconnect from './Handlers/HandleDisconnect.js';
import HandleRound from './Handlers/HandleRound.js';
import HandleAnswer from './Handlers/HandleAnswer.js';

// Repositories
import RoomRepository from './Repositories/RoomRepository.js';
import PlayerRepository from './Repositories/PlayerRepository.js';

export default class Experience {
  constructor( db, io ) {
    // Defaults
    this.db = db;
    this.io = io;

    // Managers
    this.games = new Map();
    this.sockets = new SocketManager( this.io );
    this.notifier = new ClientNotifier( this.io );
    this.repositories = {
      room: new RoomRepository( this.db ),
      player: new PlayerRepository( this.db )
    };

    // Handlers
    this.hostHandler = new HandleHost( this );
    this.playerHandler = new HandlePlayers( this );
    this.disconnectHandler = new HandleDisconnect( this );
    this.roundsHandler = new HandleRound( this );
    this.answerHandler = new HandleAnswer( this );

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
    
    this.sockets.on('start-round', ( delegatedData ) => {
      const { io, data } = delegatedData;
      this.roundsHandler.startRound( io, data );
    });

    this.sockets.on('submit-answer', ( delegatedData ) => {
      const { data } = delegatedData;
      console.log( 'submit-answer', data );
      this.answerHandler.addAnswer( data );
    });
    
    this.roundsHandler.on( 'game-over', () => {
      console.log( 'Game over' );
    } );
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
    
    const { rooms, players, answers } = await this.repositories.room.getAllInitialData();

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
    // Set room data
    game.room = room;
    // game.timeToAnswer = room.timeToAnswer * 1000;
    game.timeToAnswer = 8 * 1000;

    // Add players to game
    roomPlayers.forEach(
      (player) => game.players.add( player )
    );
    
    // Add answers to game
    // TODO: Implement answer manager later
    // game.answers = new Map( roomAnswers.map((answer) => [answer.id, answer]) );
    
    return game;
  }

  startRound() {}
  endRound() {}
  update() {}
  destroy() {}
}
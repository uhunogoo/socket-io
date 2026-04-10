import Games from './Utils/Game.js';
import PlayersManager from './Utils/PlayersManager.js';
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
    this.games = new Map();
    // this.players = new PlayersManager();
    this.sockets = new SocketManager( this.io );

    // Events
    this.sockets.on('host-connect', (data) => {
      console.log('Host connected', data);
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

  hostConnect( socket ) {
    /**
     * 1. find or create game
     * 2. setup host
     * 3. setup questions
     * 4. get players from database
    */
    return async ({ roomId, playerToken, questions }) => {
      let game = this.games.get( roomId );
      if (!game) {
        // Game not found, create a new one
        const room = await this.db.getRoomById( roomId );
        const { players, answers } = await this.db.getAllRoomData( roomId );
        
        game = this.buildGame( room, players, answers );
        this.games.set( roomId, game );
      }

      // Add questions to game
      for ( const question of questions ) {
        game.questions.add( question );
      }
      
      socket.join( roomId );
      socket.isHost = true;
      socket.roomId = roomId;

      const players = game.players.getAll();
      
      socket.emit('players-update', { players });
    };
  }

  playerConnect() {
    return async ({ roomId, playerToken }) => {
      const game = this.games.get( roomId );
      if (!game) {
        return socket.emit('error', { message: 'Game not found' });
      }

      // Clean! The game manages its own players.
      const player = game.players.get( playerToken );
      if (!player) {
        return socket.emit('error', { message: 'Player not found in this game' });
      }

    };
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
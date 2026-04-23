import { EventEmitter } from 'events';

export default class SocketManager extends EventEmitter {
  constructor(io) {
    super();
    this.io = io;
  }

  // Initialize the socket manager
  init() {
    this.setConnection();
  }

  // Set up the connection listener
  setConnection() {
    this.io.on( 'connection', ( socket ) => {
      this.registerEvents( socket );
    } );
  }

  // Register all socket events
  registerEvents( socket ) {
    socket.on( 'host-connect', ( gameData ) => {
      this.emit( 'host-connect', { socket, data: gameData } );
    } );

    socket.on( 'player-connect', ( gameData ) => {
      this.emit( 'player-connect', { socket, data: gameData } );
    } );

    socket.on( 'disconnect', () => {
      this.emit( 'disconnect', { socket } );
    } );

    socket.on( 'start-round', ( gameData ) => {
      this.emit( 'start-round', { io: this.io, data: gameData } );
    } );
    
    socket.on( 'submit-answer', ( gameData ) => {
      this.emit( 'submit-answer', { io: this.io, data: gameData } );
    } );
  }
}

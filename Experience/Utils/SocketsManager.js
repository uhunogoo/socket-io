import EventEmitter from './EventEmitter.js';

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
    this.io.on('connection', (socket) => {
      this.registerEvents( socket );
    });
  }

  // Register all socket events
  registerEvents(socket) {
    socket.on('host-connect', ( gameData ) => {
      this.trigger( 'host-connect', [{ socket, data: gameData }] );
    });

    socket.on('player-connect', (gameData) => {
      this.trigger('player-connect', [{ socket, data: gameData }]);
    });

    socket.on('disconnect', () => {
      this.trigger('disconnect', [{ socket }]);
    });

    socket.on('start-round', (gameData) => {
      this.trigger('start-round', [{ socket, data: gameData }]);
    });
  }
}



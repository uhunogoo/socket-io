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
    socket.on('host-connect', (gameData) => {
      this.emit('host-connect', { socket: socket, gameData });
    });

    socket.on('player-connect', (gameData) => {
      this.emit('player-connect', { socket: socket, gameData });
    });

    socket.on('disconnect', () => {
      this.emit('disconnect', { socket: socket });
    });

    socket.on('start-round', (gameData) => {
      this.emit('start-round', { socket: socket, gameData });
    });
  }
}

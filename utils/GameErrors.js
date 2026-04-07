export class GameError extends Error {
  constructor(message, code = 'GAME_ERROR', statusCode = 400) {
    super(message);
    this.name = 'GameError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export function handleSocketError(socket, error) {
  if (error instanceof GameError) {
    socket.emit('error', { 
      message: error.message,
      code: error.code
    });
  } else {
    console.error('Unexpected error:', error);
    socket.emit('error', { message: 'Internal server error' });
  }
}
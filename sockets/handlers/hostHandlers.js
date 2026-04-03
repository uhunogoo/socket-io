import { Questions } from '../../models/Questions.js';

export const handleHostConnect = (io, socket, gameState, db) => {
  return async ({ roomId, playerToken, questions }) => {
    try {
      const room = await db.getRoom(roomId, playerToken);
      if (!room?.rows?.length) {
        return socket.emit('error', { message: 'Room not found' });
      }

      const roomData = room.rows[0];
      const gameRoom = gameState.createRoom( roomData, { force: false } );
      
      if (!gameRoom.questions) {
        gameRoom.questions = new Questions( questions );
      }

      console.log('Host connected', gameRoom.questions.toObject() );

      socket.join( roomId );
      socket.roomId = roomId;

      const playerService = gameState.getPlayerService( roomId );
      const players = Array.from( playerService.players.values() ).map(player => player.toObject());

      // Send updated players list to host
      socket.emit('players-update', { players });
    } catch (error) {
      socket.emit('error', { message: 'Failed to connect host' });
    }
  };
};
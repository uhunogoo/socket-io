export const handleHostConnect = (io, socket, gameRoomRegistry, db) => {
  return async ({ roomId, playerToken, questions }) => {
    try {
      const room = await db.getRoom(roomId, playerToken);
      if (!room?.rows?.length) {
        return socket.emit('error', { message: 'Room not found' });
      }

      const roomData = room.rows[0];
      const gameRoom = gameRoomRegistry.createGame( roomId, roomData, questions );
      // const gameRoom = gameState.createRoom( roomData, { force: false } );
      

      // console.log('Host connected', gameRoom.questions.toObject() );

      socket.join( roomId );
      socket.roomId = roomId;

      // const playerService = gameState.getPlayerService( roomId );
      const players = gameRoom.getAllPlayers();
      // Send updated players list to host
      // socket.emit('players-update', { players });
    } catch (error) {
      socket.emit('error', { message: 'Failed to connect host' });
    }
  };
};
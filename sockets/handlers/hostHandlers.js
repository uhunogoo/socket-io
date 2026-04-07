export const handleHostConnect = (io, socket, gameRoomRegistry, db) => {
  return async ({ roomId, playerToken, questions }) => {
    try {
      const room = await db.getRoom(roomId, playerToken);
      if (!room?.rows?.length) {
        return socket.emit('error', { message: 'Room not found' });
      }

      const roomData = room.rows[0];
      const existingGame = gameRoomRegistry.getGame(roomId);
      
      // Prevent duplicate host connection
      if (existingGame && existingGame.hostConnected) {
        return socket.emit('error', { message: 'Host already connected' });
      }

      const gameRoom = gameRoomRegistry.createGame( 
        roomId, 
        roomData, 
        questions, 
        { force: existingGame ? true : false } 
      );

      socket.join( roomId );
      socket.isHost = true;
      socket.roomId = roomId;
      gameRoom.hostConnected = true;

      const playerService = gameRoom.playerService;
      let players = playerService.getAllPlayers();

      // Handle server restart - load players from database if not in memory
      if (players.length === 0) {
        const dbPlayers = await db.getDbPlayersByRoom(roomId);
        for (const p of dbPlayers) {
          playerService.addPlayer({ ...p, isConnected: 0 });
        }
        players = playerService.getAllPlayers();
      }
      
      // Send updated players list to host
      socket.emit('players-update', { players });
      // io.to(roomId).emit('host-connected', { roomId }); // I currently don't have any client logic that depends on this, but we can add it back if needed for future features
    } catch (error) {
      socket.emit('error', { message: 'Failed to connect host' });
    }
  };
};
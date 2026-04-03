export const handleJoinRoom = ( io, socket, gameState, db ) => {
  return async ({ roomId, playerToken }) => {
    try {
      const room = gameState.getRoom( roomId );
      
      if (!room) {
        socket.leave(roomId);
        return socket.emit('error', { message: 'Room not found' });
      }

      socket.join( roomId );
      socket.roomId = roomId;
      socket.playerToken = playerToken;
      
      const roomSize = io.sockets.adapter.rooms.get(roomId)?.size ?? 0;
      
      if (roomSize >= room.maxPlayers) {
        return socket.emit('error', { message: 'Кімната переповнена', code: 403 });
      }
      
      // Get player from database
      const playerData = await db.getDbPlayerByToken( playerToken );
      if (!playerData) {
        return socket.emit('error', { message: 'Player not found' });
      };

      // Add to PlayerService
      const playerService = gameState.getPlayerService( roomId );
      let player = playerService.players.get(playerToken);

      if ( player ) {
        // Reconnect: refresh status, keep scores/streaks
        player.isConnected = 1;
        player.lastSeenAt = Date.now();
        console.log(`🔄 Player ${playerToken} reconnected`);
      } else {
        // New join: create fresh player
        player = playerService.createPlayer({
          ...playerData,
          playerToken,
          isConnected: 1,
          lastSeenAt: Date.now()
        });

        // Update player online status in database
        await db.updateDbPlayerOnline( playerToken, 1 );
      }
      
      // Get updated players list
      const allPlayers = Array.from( playerService.players.values() ).map(player => player.toObject());

      io.to( roomId ).emit('players-update', { players: allPlayers } );
    } catch (error) {
      console.error('Error joining room:', error );
      socket.leave( roomId );
      socket.emit( 'error', { message: 'Failed to join room' } );
    }
  };
};


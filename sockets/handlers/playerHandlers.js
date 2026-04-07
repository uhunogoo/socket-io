export const handleJoinRoom = ( io, socket, gameRoomRegistry, db ) => {
  return async ({ roomId, playerToken }) => {
    try {
      const game = gameRoomRegistry.getGame( roomId );
      
      if (!game) {
        return socket.emit('error', { message: 'Room not found' });
      }

      // Get player from database
      const playerData = await db.getDbPlayerByToken( playerToken );
      if (!playerData || playerData.roomId !== roomId ) {
        return socket.emit('error', { message: 'Player not found' });
      };
      
      socket.join( roomId );
      socket.roomId = roomId;
      socket.playerToken = playerToken;

      // Add to PlayerService
      const playerService = game.playerService;
      const player = playerService.getPlayer( playerToken );

      try {
        if ( player ) {
          playerService.updatePlayer( playerToken, {
            isConnected: 1,
            lastSeenAt: Date.now()
          });
  
          console.log(`🔄 Player ${ playerToken } reconnected`);
        } else {
          playerService.addPlayer({
            ...playerData,
            playerToken,
            isConnected: 1,
            lastSeenAt: Date.now()
          });
        }
        
        // Update player online status in database
        await db.updateDbPlayerOnline( playerToken, 1 );
      } catch (error) {
        console.error('Error updating player:', error);
      }
      
      // Emit updated player list to all clients in the room
      const players = playerService.getAllPlayers();
      io.to( roomId ).emit('players-update', { players } );
      
      // If re-connect during active round, send current round data
      if ( game.status === 'playing' ) {
        const roundData = game.startRound( true );
        socket.emit( 'round-started', roundData );
      }

    } catch (error) {
      console.error('Error joining room:', error );
      socket.leave( roomId );
      socket.emit( 'error', { message: 'Failed to join room' } );
    }
  };
};


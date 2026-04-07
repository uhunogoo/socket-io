export const handleDisconnect = ( io, socket, gameRoomRegistry, db ) => {
  return async () => {
    const { playerToken, roomId } = socket;

    if (playerToken && roomId) {
      try {
        const game = gameRoomRegistry.getGame( roomId );
        const playerService = game.playerService;

        if (!playerService) {
          console.warn(`[Disconnect] No PlayerService for room ${roomId}`);
          return;
        }

        if (socket.isHost) {
          if ( game ) {
            game.hostConnected = false;
            io.to( roomId ).emit( 'host-disconnected' );
            return;
          }
        }

        const updated = playerService.updatePlayer( playerToken, {
          isConnected: 0,
          lastSeenAt: Date.now()
        });
        if (!updated) {
          console.warn(`[Disconnect] Player ${ playerToken } not found in room ${ roomId }`);
          return;
        }

        // // Persist offline status
        await db.updateDbPlayerOnline( playerToken, 0 );

        // // Broadcast updated player list
        const players = playerService.getAllPlayers();
        
        io.to( roomId ).emit('players-update', { players });

        // console.log(`✅ Player ${playerToken} disconnected from room ${roomId}`);
      } catch (error) {
        console.error('❌ Error handling disconnect:', error);
      }
    }
  };
};
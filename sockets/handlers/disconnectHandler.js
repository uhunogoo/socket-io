export const handleDisconnect = ( io, socket, gameState, db ) => {
  return async () => {
    const { playerToken, roomId } = socket;

    if (playerToken && roomId) {
      try {
        const playerService = gameState.getPlayerService( roomId );

        if (!playerService) {
          console.warn(`[Disconnect] No PlayerService for room ${roomId}`);
          return;
        }

        const removed = playerService.removeByToken( playerToken );
        if (!removed) {
          console.warn(`[Disconnect] Player ${playerToken} not found in room ${roomId}`);
          return;
        }

        // Persist offline status
        await db.updateDbPlayerOnline(playerToken, 0);

        // Broadcast updated player list
        const activePlayers = Array.from(playerService.players.values()).map(p => p.toObject());
        io.to(roomId).emit('players-update', { players: activePlayers });

        console.log(`✅ Player ${playerToken} disconnected from room ${roomId}`);
      } catch (error) {
        console.error('❌ Error handling disconnect:', error);
      }
    }
  };
};
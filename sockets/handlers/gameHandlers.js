// Host starts round
export const handleStartRound = (io, socket, gameService, db) => {
  return async ({ roomId }) => {
    try {
      // Validate host (optional)
      const game = gameService.getGame( roomId);
      if ( !game ) {
        return socket.emit('error', { message: 'Room not found' });
      }

      const roundData = game.startRound();

      io.to( roomId ).emit( 'round-started', roundData );

      game.roundManager.timer = setTimeout(() => {
        game.endRound();
        io.to( roomId ).emit( 'round-ended' );
      }, game.room.getRoundDuration() * 1000);
      
    } catch (error) {
      console.error('Start round error:', error);
      socket.emit('error', { message: 'Failed to start round' });
    }
  };
};

// Player submits answer
export const handleSubmitAnswer = (io, socket, gameService, db) => {
  return async ({ roomId, playerToken, answerIndex }) => {
    try {
      console.log('handleSubmitAnswer', roomId, playerToken, answerIndex);
    } catch (error) {
      console.error('Submit answer error:', error);
      socket.emit('error', { message: 'Failed to submit answer' });
    }
  };
};
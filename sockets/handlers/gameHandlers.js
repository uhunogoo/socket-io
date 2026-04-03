// Host starts round
export const handleStartRound = (io, socket, gameState, gameService, db) => {
  return async ({ roomId, roundIndex = 0 }) => {
    try {
      // Validate host (optional)
      const room = gameState.getRoom(roomId);
      if (!room) {
        return socket.emit('error', { message: 'Room not found' });
      }

      // ✅ Start round via GameService
      await gameService.startRound(roomId, roundIndex, io);

    } catch (error) {
      console.error('Start round error:', error);
      socket.emit('error', { message: 'Failed to start round' });
    }
  };
};

// Player submits answer
export const handleSubmitAnswer = (io, socket, gameState, gameService, db) => {
  return async ({ roomId, playerToken, answerIndex }) => {
    try {
      console.log('handleSubmitAnswer', roomId, playerToken, answerIndex);
      
      // TODO: rest of job

      // const room = gameState.getRoom(roomId);
      // if (!room?.isRoundActive) {
      //   return socket.emit('error', { message: 'No active round' });
      // }

      // // Validate socket ownership (basic check)
      // if (socket.playerToken !== playerToken) {
      //   return socket.emit('error', { message: 'Unauthorized' });
      // }

      // // ✅ Process answer via GameService
      // const result = gameService.handleAnswer(roomId, playerToken, answerIndex, io);
      // if (!result.success) return;

      // // Optional: broadcast partial progress (e.g., X/5 answered)
      // const answeredCount = room.answers.filter(a => a.playerToken === playerToken).length;
      // io.to(roomId).emit('answer-received', { playerToken, answeredCount });

    } catch (error) {
      console.error('Submit answer error:', error);
      socket.emit('error', { message: 'Failed to submit answer' });
    }
  };
};